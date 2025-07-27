import { NextRequest, NextResponse } from 'next/server'
import { healthCheck } from '@/lib/server-init'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  try {
    const health = await healthCheck()
    
    const status = health.overall ? 200 : 503
    
    const response = {
      status: health.overall ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        jobQueue: {
          status: health.jobQueue ? 'healthy' : 'unhealthy'
        },
        webSocket: {
          status: health.webSocket ? 'healthy' : 'unhealthy'
        }
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'unknown'
    }

    if (status === 503) {
      logger.warn('Health check failed', response)
    }

    return NextResponse.json(response, { status })
  } catch (error) {
    logger.error('Health check error:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}