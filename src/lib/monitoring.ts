import { logger } from './logger'
import { getJobQueue } from './job-queue'
import { getWebSocketServer } from './websocket-server'
import { prisma } from './prisma'

export interface SystemMetrics {
  timestamp: Date
  jobQueue: {
    pending: number
    active: number
    completed: number
    failed: number
    uptime: number
  }
  webSocket: {
    connectedUsers: number
    totalConnections: number
    onlineUsers: number
  }
  database: {
    responseTime: number
    connectionStatus: 'connected' | 'disconnected' | 'error'
  }
  memory: {
    used: number
    total: number
    percentage: number
  }
  performance: {
    averageResponseTime: number
    requestsPerMinute: number
    errorRate: number
  }
}

export interface AlertThresholds {
  memory: {
    warningPercent: number
    criticalPercent: number
  }
  database: {
    maxResponseTime: number
  }
  errorRate: {
    warningPercent: number
    criticalPercent: number
  }
  jobQueue: {
    maxPendingJobs: number
    maxFailedJobs: number
  }
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
  memory: {
    warningPercent: 80,
    criticalPercent: 90
  },
  database: {
    maxResponseTime: 1000 // ms
  },
  errorRate: {
    warningPercent: 5,
    criticalPercent: 15
  },
  jobQueue: {
    maxPendingJobs: 100,
    maxFailedJobs: 50
  }
}

class MonitoringService {
  private metrics: SystemMetrics[] = []
  private alerts: Array<{
    id: string
    type: 'warning' | 'critical'
    message: string
    timestamp: Date
    resolved: boolean
  }> = []
  private thresholds: AlertThresholds
  private isMonitoring = false
  private monitoringInterval?: NodeJS.Timeout
  private performanceTracker = {
    requests: 0,
    errors: 0,
    totalResponseTime: 0,
    startTime: Date.now()
  }

  constructor(thresholds: Partial<AlertThresholds> = {}) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds }
  }

  async startMonitoring(intervalMs: number = 60000): Promise<void> {
    if (this.isMonitoring) {
      logger.warn('Monitoring already started')
      return
    }

    this.isMonitoring = true
    logger.info('Starting system monitoring', { intervalMs })

    this.monitoringInterval = setInterval(async () => {
      try {
        const metrics = await this.collectMetrics()
        this.metrics.push(metrics)
        
        // Keep only last 24 hours of metrics (1440 minutes)
        const maxMetrics = Math.ceil((24 * 60 * 60 * 1000) / intervalMs)
        if (this.metrics.length > maxMetrics) {
          this.metrics = this.metrics.slice(-maxMetrics)
        }

        await this.checkAlerts(metrics)
      } catch (error) {
        logger.error('Error collecting metrics:', error)
      }
    }, intervalMs)
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = undefined
    }
    this.isMonitoring = false
    logger.info('Monitoring stopped')
  }

  async collectMetrics(): Promise<SystemMetrics> {
    const timestamp = new Date()

    // Job Queue Metrics
    let jobQueueMetrics = {
      pending: 0,
      active: 0,
      completed: 0,
      failed: 0,
      uptime: 0
    }

    try {
      const jobQueue = await getJobQueue()
      const stats = await jobQueue.getStats()
      jobQueueMetrics = {
        ...stats,
        uptime: Date.now() - this.performanceTracker.startTime
      }
    } catch (error) {
      logger.error('Failed to collect job queue metrics:', error)
    }

    // WebSocket Metrics
    let webSocketMetrics = {
      connectedUsers: 0,
      totalConnections: 0,
      onlineUsers: 0
    }

    try {
      const wsServer = getWebSocketServer()
      if (wsServer) {
        webSocketMetrics = wsServer.getStats()
      }
    } catch (error) {
      logger.error('Failed to collect WebSocket metrics:', error)
    }

    // Database Metrics
    let databaseMetrics = {
      responseTime: 0,
      connectionStatus: 'disconnected' as const
    }

    try {
      const startTime = Date.now()
      await prisma.user.count()
      const responseTime = Date.now() - startTime
      
      databaseMetrics = {
        responseTime,
        connectionStatus: 'connected'
      }
    } catch (error) {
      logger.error('Database health check failed:', error)
      databaseMetrics.connectionStatus = 'error'
    }

    // Memory Metrics
    const memUsage = process.memoryUsage()
    const memoryMetrics = {
      used: memUsage.heapUsed,
      total: memUsage.heapTotal,
      percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100
    }

    // Performance Metrics
    const minutesRunning = (Date.now() - this.performanceTracker.startTime) / (1000 * 60)
    const performanceMetrics = {
      averageResponseTime: this.performanceTracker.requests > 0 
        ? this.performanceTracker.totalResponseTime / this.performanceTracker.requests 
        : 0,
      requestsPerMinute: minutesRunning > 0 ? this.performanceTracker.requests / minutesRunning : 0,
      errorRate: this.performanceTracker.requests > 0 
        ? (this.performanceTracker.errors / this.performanceTracker.requests) * 100 
        : 0
    }

    return {
      timestamp,
      jobQueue: jobQueueMetrics,
      webSocket: webSocketMetrics,
      database: databaseMetrics,
      memory: memoryMetrics,
      performance: performanceMetrics
    }
  }

  private async checkAlerts(metrics: SystemMetrics): Promise<void> {
    const alerts: Array<{ type: 'warning' | 'critical', message: string }> = []

    // Memory alerts
    if (metrics.memory.percentage > this.thresholds.memory.criticalPercent) {
      alerts.push({
        type: 'critical',
        message: `Critical memory usage: ${metrics.memory.percentage.toFixed(1)}%`
      })
    } else if (metrics.memory.percentage > this.thresholds.memory.warningPercent) {
      alerts.push({
        type: 'warning',
        message: `High memory usage: ${metrics.memory.percentage.toFixed(1)}%`
      })
    }

    // Database alerts
    if (metrics.database.connectionStatus === 'error') {
      alerts.push({
        type: 'critical',
        message: 'Database connection failed'
      })
    } else if (metrics.database.responseTime > this.thresholds.database.maxResponseTime) {
      alerts.push({
        type: 'warning',
        message: `Slow database response: ${metrics.database.responseTime}ms`
      })
    }

    // Error rate alerts
    if (metrics.performance.errorRate > this.thresholds.errorRate.criticalPercent) {
      alerts.push({
        type: 'critical',
        message: `Critical error rate: ${metrics.performance.errorRate.toFixed(1)}%`
      })
    } else if (metrics.performance.errorRate > this.thresholds.errorRate.warningPercent) {
      alerts.push({
        type: 'warning',
        message: `High error rate: ${metrics.performance.errorRate.toFixed(1)}%`
      })
    }

    // Job queue alerts
    if (metrics.jobQueue.pending > this.thresholds.jobQueue.maxPendingJobs) {
      alerts.push({
        type: 'warning',
        message: `High number of pending jobs: ${metrics.jobQueue.pending}`
      })
    }

    if (metrics.jobQueue.failed > this.thresholds.jobQueue.maxFailedJobs) {
      alerts.push({
        type: 'warning',
        message: `High number of failed jobs: ${metrics.jobQueue.failed}`
      })
    }

    // Process new alerts
    for (const alert of alerts) {
      await this.createAlert(alert.type, alert.message)
    }
  }

  private async createAlert(type: 'warning' | 'critical', message: string): Promise<void> {
    const alertId = `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    
    const alert = {
      id: alertId,
      type,
      message,
      timestamp: new Date(),
      resolved: false
    }

    this.alerts.push(alert)

    // Log alert
    if (type === 'critical') {
      logger.error(`🚨 CRITICAL ALERT: ${message}`, { alertId })
    } else {
      logger.warn(`⚠️ WARNING ALERT: ${message}`, { alertId })
    }

    // Send admin notification for critical alerts
    if (type === 'critical') {
      try {
        const { sendAdminNotificationEmail } = await import('./email-service')
        await sendAdminNotificationEmail('system_alert', {
          type,
          message,
          timestamp: alert.timestamp.toISOString(),
          alertId
        })
      } catch (error) {
        logger.error('Failed to send alert notification:', error)
      }
    }

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100)
    }
  }

  // Performance tracking methods
  trackRequest(responseTime: number, isError: boolean = false): void {
    this.performanceTracker.requests++
    this.performanceTracker.totalResponseTime += responseTime
    
    if (isError) {
      this.performanceTracker.errors++
    }
  }

  resetPerformanceCounters(): void {
    this.performanceTracker = {
      requests: 0,
      errors: 0,
      totalResponseTime: 0,
      startTime: Date.now()
    }
  }

  // Getter methods
  getLatestMetrics(): SystemMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null
  }

  getMetricsHistory(hours: number = 1): SystemMetrics[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000)
    return this.metrics.filter(m => m.timestamp >= cutoff)
  }

  getActiveAlerts(): typeof this.alerts {
    return this.alerts.filter(a => !a.resolved)
  }

  getAllAlerts(): typeof this.alerts {
    return [...this.alerts]
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.resolved = true
      logger.info(`Alert resolved: ${alert.message}`, { alertId })
      return true
    }
    return false
  }

  isHealthy(): boolean {
    const activeAlerts = this.getActiveAlerts()
    const criticalAlerts = activeAlerts.filter(a => a.type === 'critical')
    return criticalAlerts.length === 0
  }

  getHealthScore(): number {
    const activeAlerts = this.getActiveAlerts()
    const criticalAlerts = activeAlerts.filter(a => a.type === 'critical')
    const warningAlerts = activeAlerts.filter(a => a.type === 'warning')
    
    let score = 100
    score -= criticalAlerts.length * 25 // -25 points per critical alert
    score -= warningAlerts.length * 5  // -5 points per warning alert
    
    return Math.max(0, score)
  }
}

// Singleton instance
let monitoringService: MonitoringService | null = null

export function getMonitoringService(): MonitoringService {
  if (!monitoringService) {
    monitoringService = new MonitoringService()
  }
  return monitoringService
}

export async function initializeMonitoring(): Promise<MonitoringService> {
  const service = getMonitoringService()
  await service.startMonitoring()
  logger.info('Monitoring service initialized')
  return service
}

export { MonitoringService }
export default getMonitoringService