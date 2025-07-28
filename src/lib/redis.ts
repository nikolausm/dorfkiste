import { createClient, RedisClientType } from 'redis'
import { log } from './logger'

let redisClient: RedisClientType | null = null

// Redis connection configuration
const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 5000,
    reconnectStrategy: (retries: number) => {
      if (retries > 10) {
        log.error('Redis: Max reconnection attempts reached')
        return new Error('Max reconnection attempts reached')
      }
      const delay = Math.min(retries * 100, 3000)
      log.info(`Redis: Reconnecting in ${delay}ms (attempt ${retries})`)
      return delay
    }
  }
}

// Initialize Redis client
export async function initRedis(): Promise<RedisClientType | null> {
  if (redisClient) {
    return redisClient
  }

  try {
    redisClient = createClient(redisConfig)

    // Error handling
    redisClient.on('error', (err) => {
      log.error('Redis client error:', err)
    })

    redisClient.on('connect', () => {
      log.info('Redis: Connected successfully')
    })

    redisClient.on('ready', () => {
      log.info('Redis: Ready to accept commands')
    })

    redisClient.on('reconnecting', () => {
      log.warn('Redis: Reconnecting...')
    })

    // Connect to Redis
    await redisClient.connect()

    return redisClient
  } catch (error) {
    log.error('Failed to initialize Redis:', error)
    return null
  }
}

// Get Redis client
export async function getRedis(): Promise<RedisClientType | null> {
  if (!redisClient) {
    return await initRedis()
  }
  
  if (!redisClient.isOpen) {
    try {
      await redisClient.connect()
    } catch (error) {
      log.error('Failed to reconnect to Redis:', error)
      return null
    }
  }
  
  return redisClient
}

// Close Redis connection
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit()
      redisClient = null
      log.info('Redis: Connection closed')
    } catch (error) {
      log.error('Error closing Redis connection:', error)
    }
  }
}

// Export the Redis client (might be null if not initialized)
export { redisClient as redis }