import { Server as HTTPServer } from 'http'
import { initializeJobQueue } from './job-queue'
import { initializeWebSocketServer } from './websocket-server'
import { logger } from './logger'

let isInitialized = false

export async function initializeBackgroundServices(httpServer?: HTTPServer): Promise<void> {
  if (isInitialized) {
    logger.info('Background services already initialized')
    return
  }

  try {
    logger.info('Initializing background services...')

    // Initialize Job Queue
    logger.info('Starting job queue...')
    const jobQueue = await initializeJobQueue()
    logger.info('Job queue started successfully')

    // Initialize WebSocket Server (if HTTP server is provided)
    if (httpServer) {
      logger.info('Starting WebSocket server...')
      const wsServer = initializeWebSocketServer(httpServer)
      logger.info('WebSocket server started successfully')
    } else {
      logger.warn('HTTP server not provided, WebSocket server not initialized')
    }

    // Set up graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`)
      
      try {
        await jobQueue.disconnect()
        logger.info('Job queue disconnected')
      } catch (error) {
        logger.error('Error disconnecting job queue:', error)
      }

      process.exit(0)
    }

    process.on('SIGINT', () => gracefulShutdown('SIGINT'))
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))

    isInitialized = true
    logger.info('All background services initialized successfully')

  } catch (error) {
    logger.error('Failed to initialize background services:', error)
    throw error
  }
}

export function isBackgroundServicesInitialized(): boolean {
  return isInitialized
}

// Environment-specific initialization
export async function initializeForEnvironment(): Promise<void> {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isProduction = process.env.NODE_ENV === 'production'

  if (isDevelopment) {
    logger.info('Development environment detected')
    // In development, we might want to disable some services or use mocks
  }

  if (isProduction) {
    logger.info('Production environment detected')
    // Ensure all environment variables are set
    const requiredEnvVars = [
      'REDIS_URL',
      'RESEND_API_KEY',
      'NEXTAUTH_SECRET'
    ]

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
    
    if (missingVars.length > 0) {
      logger.error('Missing required environment variables:', missingVars)
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
    }
  }
}

// Health check for background services
export async function healthCheck(): Promise<{
  jobQueue: boolean
  webSocket: boolean
  overall: boolean
}> {
  const health = {
    jobQueue: false,
    webSocket: false,
    overall: false
  }

  try {
    // Check job queue
    const jobQueue = await import('./job-queue').then(m => m.getJobQueue())
    const stats = await jobQueue.getStats()
    health.jobQueue = true
    logger.debug('Job queue health check passed', stats)
  } catch (error) {
    logger.error('Job queue health check failed:', error)
  }

  try {
    // Check WebSocket server
    const { getWebSocketServer } = await import('./websocket-server')
    const wsServer = getWebSocketServer()
    if (wsServer) {
      const wsStats = wsServer.getStats()
      health.webSocket = true
      logger.debug('WebSocket health check passed', wsStats)
    }
  } catch (error) {
    logger.error('WebSocket health check failed:', error)
  }

  health.overall = health.jobQueue && (health.webSocket || !process.env.HTTP_SERVER_AVAILABLE)

  return health
}

export default {
  initializeBackgroundServices,
  isBackgroundServicesInitialized,
  initializeForEnvironment,
  healthCheck
}