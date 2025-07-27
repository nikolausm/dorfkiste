import { createClient, RedisClientType } from 'redis'
import * as cron from 'node-cron'
import { logger } from './logger'
import { 
  sendRentalReminderEmail, 
  sendReviewRequestEmail,
  sendAdminNotificationEmail 
} from './email-service'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Job Types
export type JobType = 
  | 'send_email'
  | 'rental_reminder' 
  | 'review_request'
  | 'payment_processing'
  | 'cleanup_expired_tokens'
  | 'daily_stats'
  | 'weekly_reports'

export interface Job {
  id: string
  type: JobType
  data: any
  scheduledAt: Date
  attempts: number
  maxAttempts: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retrying'
  createdAt: Date
  processedAt?: Date
  error?: string
}

export interface JobQueueConfig {
  redis: {
    host: string
    port: number
    password?: string
    db: number
  }
  maxRetries: number
  retryDelay: number // milliseconds
  jobTimeout: number // milliseconds
  concurrency: number
}

const DEFAULT_CONFIG: JobQueueConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0')
  },
  maxRetries: 3,
  retryDelay: 5000,
  jobTimeout: 30000,
  concurrency: 5
}

class JobQueue {
  private redis: RedisClientType
  private isRunning = false
  private config: JobQueueConfig
  private activeJobs = new Set<string>()
  private cronJobs = new Map<string, cron.ScheduledTask>()

  constructor(config: Partial<JobQueueConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.redis = createClient({
      socket: {
        host: this.config.redis.host,
        port: this.config.redis.port
      },
      password: this.config.redis.password,
      database: this.config.redis.db
    })

    this.redis.on('error', (error) => {
      logger.error('Redis connection error:', error)
    })

    this.redis.on('connect', () => {
      logger.info('Connected to Redis for job queue')
    })
  }

  async connect(): Promise<void> {
    await this.redis.connect()
  }

  async disconnect(): Promise<void> {
    this.stop()
    await this.redis.disconnect()
  }

  // Add job to queue
  async addJob(
    type: JobType, 
    data: any, 
    options: {
      delay?: number // milliseconds
      maxAttempts?: number
      priority?: number
    } = {}
  ): Promise<string> {
    const jobId = `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    const scheduledAt = new Date(Date.now() + (options.delay || 0))
    
    const job: Job = {
      id: jobId,
      type,
      data,
      scheduledAt,
      attempts: 0,
      maxAttempts: options.maxAttempts || this.config.maxRetries,
      status: 'pending',
      createdAt: new Date()
    }

    // Store job in Redis with score as timestamp for priority queue
    const score = scheduledAt.getTime()
    await this.redis.zAdd('jobs:pending', {
      score,
      value: JSON.stringify(job)
    })

    logger.info(`Job ${jobId} added to queue`, { type, scheduledAt, delay: options.delay })
    return jobId
  }

  // Add scheduled job (recurring)
  async addScheduledJob(
    name: string,
    cronExpression: string,
    type: JobType,
    data: any
  ): Promise<void> {
    if (this.cronJobs.has(name)) {
      this.cronJobs.get(name)?.stop()
    }

    const task = cron.schedule(cronExpression, async () => {
      await this.addJob(type, data)
      logger.info(`Scheduled job ${name} executed`, { type, cronExpression })
    }, {
      scheduled: false
    })

    this.cronJobs.set(name, task)
    task.start()
    logger.info(`Scheduled job ${name} registered`, { cronExpression, type })
  }

  // Start processing jobs
  async start(): Promise<void> {
    if (this.isRunning) return

    this.isRunning = true
    logger.info('Job queue processor started')

    // Process jobs continuously
    this.processJobs()

    // Setup scheduled jobs
    await this.setupScheduledJobs()
  }

  // Stop processing jobs
  stop(): void {
    this.isRunning = false
    
    // Stop all cron jobs
    this.cronJobs.forEach(task => task.stop())
    this.cronJobs.clear()
    
    logger.info('Job queue processor stopped')
  }

  // Main job processing loop
  private async processJobs(): Promise<void> {
    while (this.isRunning) {
      try {
        // Respect concurrency limit
        if (this.activeJobs.size >= this.config.concurrency) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          continue
        }

        // Get next job from queue
        const now = Date.now()
        const result = await this.redis.zRangeByScore('jobs:pending', 0, now, {
          LIMIT: { offset: 0, count: 1 }
        })

        if (result.length === 0) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          continue
        }

        const jobData = result[0]
        const job: Job = JSON.parse(jobData)

        // Remove from pending queue
        await this.redis.zRem('jobs:pending', jobData)

        // Process job
        this.processJob(job)

      } catch (error) {
        logger.error('Error in job processing loop:', error)
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }
  }

  // Process individual job
  private async processJob(job: Job): Promise<void> {
    this.activeJobs.add(job.id)
    job.status = 'processing'
    job.attempts++

    const timeout = setTimeout(() => {
      logger.error(`Job ${job.id} timed out`)
      this.handleJobFailure(job, new Error('Job timeout'))
    }, this.config.jobTimeout)

    try {
      logger.info(`Processing job ${job.id}`, { type: job.type, attempt: job.attempts })

      await this.executeJob(job)

      clearTimeout(timeout)
      await this.handleJobSuccess(job)

    } catch (error) {
      clearTimeout(timeout)
      await this.handleJobFailure(job, error as Error)
    } finally {
      this.activeJobs.delete(job.id)
    }
  }

  // Execute job based on type
  private async executeJob(job: Job): Promise<void> {
    switch (job.type) {
      case 'send_email':
        await this.processSendEmailJob(job)
        break

      case 'rental_reminder':
        await this.processRentalReminderJob(job)
        break

      case 'review_request':
        await this.processReviewRequestJob(job)
        break

      case 'payment_processing':
        await this.processPaymentJob(job)
        break

      case 'cleanup_expired_tokens':
        await this.processCleanupJob(job)
        break

      case 'daily_stats':
        await this.processDailyStatsJob(job)
        break

      case 'weekly_reports':
        await this.processWeeklyReportsJob(job)
        break

      default:
        throw new Error(`Unknown job type: ${job.type}`)
    }
  }

  // Job handlers
  private async processSendEmailJob(job: Job): Promise<void> {
    const { emailFunction, params } = job.data
    
    // Dynamic email function calling
    const emailService = await import('./email-service')
    if (typeof emailService[emailFunction] === 'function') {
      await emailService[emailFunction](...params)
    } else {
      throw new Error(`Unknown email function: ${emailFunction}`)
    }
  }

  private async processRentalReminderJob(job: Job): Promise<void> {
    const { rentalId } = job.data
    
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: {
        item: true,
        renter: true,
        owner: true
      }
    })

    if (!rental) {
      throw new Error(`Rental ${rentalId} not found`)
    }

    // Only send if rental starts tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const rentalStart = new Date(rental.startDate)
    rentalStart.setHours(0, 0, 0, 0)

    if (rentalStart.getTime() === tomorrow.getTime()) {
      await sendRentalReminderEmail(rental)
    }
  }

  private async processReviewRequestJob(job: Job): Promise<void> {
    const { rentalId } = job.data
    
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: {
        item: true,
        renter: true,
        owner: true
      }
    })

    if (!rental || rental.status !== 'completed') {
      return // Skip if rental not found or not completed
    }

    // Check if review already exists
    const existingReview = await prisma.review.findFirst({
      where: {
        rentalId: rental.id,
        reviewerId: rental.renterId
      }
    })

    if (!existingReview) {
      await sendReviewRequestEmail(rental)
    }
  }

  private async processPaymentJob(job: Job): Promise<void> {
    const { rentalId, amount, paymentMethodId } = job.data
    
    // Implement payment processing logic here
    // This would typically integrate with Stripe or PayPal
    logger.info(`Processing payment for rental ${rentalId}`, { amount })
    
    // Update rental status after successful payment
    await prisma.rental.update({
      where: { id: rentalId },
      data: { status: 'confirmed' }
    })
  }

  private async processCleanupJob(job: Job): Promise<void> {
    const now = new Date()
    
    // Clean up expired password reset tokens
    const deletedTokens = await prisma.passwordResetToken.deleteMany({
      where: {
        expiresAt: { lt: now }
      }
    })

    logger.info(`Cleaned up ${deletedTokens.count} expired password reset tokens`)

    // Clean up old job logs (older than 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    await this.redis.zRemRangeByScore('jobs:completed', 0, thirtyDaysAgo.getTime())
    await this.redis.zRemRangeByScore('jobs:failed', 0, thirtyDaysAgo.getTime())
  }

  private async processDailyStatsJob(job: Job): Promise<void> {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)
    
    const today = new Date(yesterday)
    today.setDate(today.getDate() + 1)

    // Gather daily statistics
    const stats = {
      newUsers: await prisma.user.count({
        where: {
          createdAt: {
            gte: yesterday,
            lt: today
          }
        }
      }),
      newItems: await prisma.item.count({
        where: {
          createdAt: {
            gte: yesterday,
            lt: today
          }
        }
      }),
      newRentals: await prisma.rental.count({
        where: {
          createdAt: {
            gte: yesterday,
            lt: today
          }
        }
      }),
      totalRevenue: await prisma.rental.aggregate({
        where: {
          createdAt: {
            gte: yesterday,
            lt: today
          },
          status: 'completed'
        },
        _sum: { totalPrice: true }
      })
    }

    // Send admin notification
    await sendAdminNotificationEmail('daily_stats', {
      date: yesterday.toISOString() ? yesterday.toISOString().split('T')[0] : '',
      ...stats
    })

    logger.info('Daily stats processed', stats)
  }

  private async processWeeklyReportsJob(job: Job): Promise<void> {
    // Implement weekly reporting logic
    logger.info('Weekly reports job executed')
  }

  // Handle job success
  private async handleJobSuccess(job: Job): Promise<void> {
    job.status = 'completed'
    job.processedAt = new Date()

    // Store in completed jobs
    await this.redis.zAdd('jobs:completed', {
      score: Date.now(),
      value: JSON.stringify(job)
    })

    logger.info(`Job ${job.id} completed successfully`, { 
      type: job.type, 
      attempts: job.attempts 
    })
  }

  // Handle job failure
  private async handleJobFailure(job: Job, error: Error): Promise<void> {
    job.error = error.message
    
    if (job.attempts < job.maxAttempts) {
      // Retry job with exponential backoff
      job.status = 'retrying'
      const delay = this.config.retryDelay * Math.pow(2, job.attempts - 1)
      job.scheduledAt = new Date(Date.now() + delay)

      await this.redis.zAdd('jobs:pending', {
        score: job.scheduledAt.getTime(),
        value: JSON.stringify(job)
      })

      logger.warn(`Job ${job.id} failed, retrying in ${delay}ms`, { 
        type: job.type, 
        attempts: job.attempts,
        error: error.message 
      })
    } else {
      // Job failed permanently
      job.status = 'failed'
      job.processedAt = new Date()

      await this.redis.zAdd('jobs:failed', {
        score: Date.now(),
        value: JSON.stringify(job)
      })

      logger.error(`Job ${job.id} failed permanently`, { 
        type: job.type, 
        attempts: job.attempts,
        error: error.message 
      })
    }
  }

  // Setup scheduled jobs
  private async setupScheduledJobs(): Promise<void> {
    // Daily cleanup at 2 AM
    await this.addScheduledJob(
      'daily_cleanup',
      '0 2 * * *',
      'cleanup_expired_tokens',
      {}
    )

    // Daily stats at 6 AM
    await this.addScheduledJob(
      'daily_stats',
      '0 6 * * *',
      'daily_stats',
      {}
    )

    // Weekly reports on Monday at 8 AM
    await this.addScheduledJob(
      'weekly_reports',
      '0 8 * * 1',
      'weekly_reports',
      {}
    )

    // Check for rental reminders every day at 9 AM
    await this.addScheduledJob(
      'check_rental_reminders',
      '0 9 * * *',
      'rental_reminder',
      {}
    )

    logger.info('Scheduled jobs setup completed')
  }

  // Get queue statistics
  async getStats(): Promise<{
    pending: number
    active: number
    completed: number
    failed: number
  }> {
    const [pending, completed, failed] = await Promise.all([
      this.redis.zCard('jobs:pending'),
      this.redis.zCard('jobs:completed'),
      this.redis.zCard('jobs:failed')
    ])

    return {
      pending,
      active: this.activeJobs.size,
      completed,
      failed
    }
  }

  // Helper methods for specific job scheduling
  async scheduleRentalReminder(rentalId: string, reminderDate: Date): Promise<string> {
    const delay = reminderDate.getTime() - Date.now()
    return this.addJob('rental_reminder', { rentalId }, { delay })
  }

  async scheduleReviewRequest(rentalId: string, reviewRequestDate: Date): Promise<string> {
    const delay = reviewRequestDate.getTime() - Date.now()
    return this.addJob('review_request', { rentalId }, { delay })
  }

  async scheduleEmail(emailFunction: string, params: any[], delay: number = 0): Promise<string> {
    return this.addJob('send_email', { emailFunction, params }, { delay })
  }
}

// Singleton instance
let jobQueue: JobQueue | null = null

export async function getJobQueue(): Promise<JobQueue> {
  if (!jobQueue) {
    jobQueue = new JobQueue()
    await jobQueue.connect()
  }
  return jobQueue
}

export async function initializeJobQueue(): Promise<JobQueue> {
  const queue = await getJobQueue()
  await queue.start()
  return queue
}

export { JobQueue }
export default JobQueue