import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getJobQueue } from '@/lib/job-queue'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const scheduleJobSchema = z.object({
  type: z.enum([
    'send_email', 
    'rental_reminder', 
    'review_request', 
    'payment_processing',
    'cleanup_expired_tokens'
  ]),
  data: z.record(z.any()),
  delay: z.number().optional(),
  maxAttempts: z.number().min(1).max(10).optional()
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only admin users can schedule jobs manually
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validation = scheduleJobSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { type, data, delay, maxAttempts } = validation.data

    const jobQueue = await getJobQueue()
    const jobId = await jobQueue.addJob(type, data, {
      delay,
      maxAttempts
    })

    logger.info(`Job scheduled by admin ${session.user.id}`, {
      jobId,
      type,
      delay,
      adminId: session.user.id
    })

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Job scheduled successfully'
    })

  } catch (error) {
    logger.error('Error scheduling job:', error)
    return NextResponse.json(
      { error: 'Failed to schedule job' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const jobQueue = await getJobQueue()
    const stats = await jobQueue.getStats()

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    logger.error('Error getting job stats:', error)
    return NextResponse.json(
      { error: 'Failed to get job statistics' },
      { status: 500 }
    )
  }
}