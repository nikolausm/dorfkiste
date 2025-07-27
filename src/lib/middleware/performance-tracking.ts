import { NextRequest, NextResponse } from 'next/server'
import { getMonitoringService } from '../monitoring'
import { logger } from '../logger'

export interface RequestMetrics {
  path: string
  method: string
  statusCode: number
  responseTime: number
  userAgent?: string
  ip?: string
  userId?: string
  timestamp: Date
}

class PerformanceTracker {
  private static instance: PerformanceTracker
  private requestMetrics: RequestMetrics[] = []
  private readonly maxMetrics = 1000 // Keep last 1000 requests

  private constructor() {}

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker()
    }
    return PerformanceTracker.instance
  }

  trackRequest(metrics: RequestMetrics): void {
    this.requestMetrics.push(metrics)
    
    // Keep only recent requests
    if (this.requestMetrics.length > this.maxMetrics) {
      this.requestMetrics = this.requestMetrics.slice(-this.maxMetrics)
    }

    // Track in monitoring service
    try {
      const monitoring = getMonitoringService()
      const isError = metrics.statusCode >= 400
      monitoring.trackRequest(metrics.responseTime, isError)
    } catch (error) {
      logger.error('Failed to track request in monitoring service:', error)
    }

    // Log slow requests
    if (metrics.responseTime > 1000) {
      logger.warn('Slow request detected', {
        path: metrics.path,
        method: metrics.method,
        responseTime: metrics.responseTime,
        statusCode: metrics.statusCode
      })
    }

    // Log errors
    if (metrics.statusCode >= 400) {
      logger.error('Request error', {
        path: metrics.path,
        method: metrics.method,
        statusCode: metrics.statusCode,
        responseTime: metrics.responseTime,
        userAgent: metrics.userAgent,
        ip: metrics.ip
      })
    }
  }

  getMetrics(hours: number = 1): RequestMetrics[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000)
    return this.requestMetrics.filter(m => m.timestamp >= cutoff)
  }

  getAverageResponseTime(hours: number = 1): number {
    const metrics = this.getMetrics(hours)
    if (metrics.length === 0) return 0
    
    const total = metrics.reduce((sum, m) => sum + m.responseTime, 0)
    return total / metrics.length
  }

  getErrorRate(hours: number = 1): number {
    const metrics = this.getMetrics(hours)
    if (metrics.length === 0) return 0
    
    const errors = metrics.filter(m => m.statusCode >= 400).length
    return (errors / metrics.length) * 100
  }

  getRequestsPerMinute(hours: number = 1): number {
    const metrics = this.getMetrics(hours)
    const minutes = hours * 60
    return metrics.length / minutes
  }

  getSlowestEndpoints(limit: number = 10, hours: number = 1): Array<{
    path: string
    averageTime: number
    requestCount: number
  }> {
    const metrics = this.getMetrics(hours)
    const pathStats = new Map<string, { total: number, count: number }>()

    metrics.forEach(m => {
      const existing = pathStats.get(m.path) || { total: 0, count: 0 }
      pathStats.set(m.path, {
        total: existing.total + m.responseTime,
        count: existing.count + 1
      })
    })

    return Array.from(pathStats.entries())
      .map(([path, stats]) => ({
        path,
        averageTime: stats.total / stats.count,
        requestCount: stats.count
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, limit)
  }

  getMostErrorProneEndpoints(limit: number = 10, hours: number = 1): Array<{
    path: string
    errorRate: number
    totalRequests: number
    errors: number
  }> {
    const metrics = this.getMetrics(hours)
    const pathStats = new Map<string, { total: number, errors: number }>()

    metrics.forEach(m => {
      const existing = pathStats.get(m.path) || { total: 0, errors: 0 }
      pathStats.set(m.path, {
        total: existing.total + 1,
        errors: existing.errors + (m.statusCode >= 400 ? 1 : 0)
      })
    })

    return Array.from(pathStats.entries())
      .map(([path, stats]) => ({
        path,
        errorRate: (stats.errors / stats.total) * 100,
        totalRequests: stats.total,
        errors: stats.errors
      }))
      .filter(item => item.errors > 0)
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, limit)
  }
}

export function createPerformanceMiddleware() {
  const tracker = PerformanceTracker.getInstance()

  return function performanceMiddleware(
    request: NextRequest,
    response: NextResponse,
    next?: () => void
  ) {
    const startTime = Date.now()
    
    // Extract request info
    const path = request.nextUrl.pathname
    const method = request.method
    const userAgent = request.headers.get('user-agent') || undefined
    const ip = request.ip || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined

    // Handle response completion
    const originalJson = response.json.bind(response)
    response.json = function(body: any) {
      const responseTime = Date.now() - startTime
      
      tracker.trackRequest({
        path,
        method,
        statusCode: response.status,
        responseTime,
        userAgent,
        ip,
        timestamp: new Date()
      })

      return originalJson(body)
    }

    if (next) {
      next()
    }

    return response
  }
}

export function getPerformanceTracker(): PerformanceTracker {
  return PerformanceTracker.getInstance()
}

// Express-style middleware for API routes
export function withPerformanceTracking(handler: any) {
  return async function trackedHandler(req: NextRequest, ...args: any[]) {
    const startTime = Date.now()
    const tracker = PerformanceTracker.getInstance()
    
    try {
      const response = await handler(req, ...args)
      const responseTime = Date.now() - startTime
      
      // Extract response info
      let statusCode = 200
      if (response instanceof Response) {
        statusCode = response.status
      } else if (response && typeof response === 'object' && 'status' in response) {
        statusCode = response.status
      }

      tracker.trackRequest({
        path: req.nextUrl.pathname,
        method: req.method,
        statusCode,
        responseTime,
        userAgent: req.headers.get('user-agent') || undefined,
        ip: req.ip || req.headers.get('x-forwarded-for') || undefined,
        timestamp: new Date()
      })

      return response
    } catch (error) {
      const responseTime = Date.now() - startTime
      
      tracker.trackRequest({
        path: req.nextUrl.pathname,
        method: req.method,
        statusCode: 500,
        responseTime,
        userAgent: req.headers.get('user-agent') || undefined,
        ip: req.ip || req.headers.get('x-forwarded-for') || undefined,
        timestamp: new Date()
      })

      throw error
    }
  }
}

export default PerformanceTracker