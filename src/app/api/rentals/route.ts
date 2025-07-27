import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from 'zod'
import { 
  rentalRequestSchema, 
  createValidationMiddleware,
  createValidationErrorResponse,
  validateData
} from "@/lib/validation"
import { 
  sendNewRentalRequestEmail, 
  sendRentalConfirmationEmail,
  sendAdminNotificationEmail 
} from "@/lib/email-service"
import { getJobQueue } from "@/lib/job-queue"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    
    // Validate query parameters
    const queryData = {
      role: searchParams.get("role") || undefined,
      status: searchParams.get("status") || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 20
    }

    // Create a schema for rental query params
    const rentalQuerySchema = z.object({
      role: z.enum(['renter', 'owner']).optional(),
      status: z.enum(['pending', 'confirmed', 'active', 'completed', 'cancelled']).optional(),
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(100).default(20)
    })

    const validation = validateData(rentalQuerySchema, queryData)
    
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors!)
    }

    const { role, status, page, limit } = validation.data!
    const skip = (page - 1) * limit

    const where: any = {}

    if (role === 'renter') {
      where.renterId = session.user.id
    } else if (role === 'owner') {
      where.ownerId = session.user.id
    } else {
      // Show all rentals where user is either renter or owner
      where.OR = [
        { renterId: session.user.id },
        { ownerId: session.user.id },
      ]
    }

    if (status) {
      where.status = status
    }

    const [rentals, total] = await Promise.all([
      prisma.rental.findMany({
        where,
        skip,
        take: limit,
        include: {
          item: {
            include: {
              images: {
                orderBy: { order: 'asc' },
                take: 1,
              },
              category: true,
            },
          },
          owner: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          renter: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.rental.count({ where }),
    ])

    return NextResponse.json({
      rentals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching rentals:", error)
    return NextResponse.json(
      { error: "Failed to fetch rentals" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Validate request body
    const validateRental = createValidationMiddleware(rentalRequestSchema)
    const validation = await validateRental(request, 'body')
    
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors!)
    }

    const { itemId, startDate, endDate, message, deliveryOption, deliveryAddress } = validation.data!

    // Fetch item details
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      select: {
        id: true,
        userId: true,
        pricePerDay: true,
        pricePerHour: true,
        deposit: true,
        available: true,
      },
    })

    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      )
    }

    if (!item.available) {
      return NextResponse.json(
        { error: "Item is not available" },
        { status: 400 }
      )
    }

    if (item.userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot rent your own item" },
        { status: 400 }
      )
    }

    // Check for overlapping rentals
    const overlappingRentals = await prisma.rental.count({
      where: {
        itemId,
        status: {
          in: ['confirmed', 'active'],
        },
        OR: [
          {
            AND: [
              { startDate: { lte: new Date(startDate) } },
              { endDate: { gte: new Date(startDate) } },
            ],
          },
          {
            AND: [
              { startDate: { lte: new Date(endDate) } },
              { endDate: { gte: new Date(endDate) } },
            ],
          },
          {
            AND: [
              { startDate: { gte: new Date(startDate) } },
              { endDate: { lte: new Date(endDate) } },
            ],
          },
        ],
      },
    })

    if (overlappingRentals > 0) {
      return NextResponse.json(
        { error: "Item is already booked for these dates" },
        { status: 400 }
      )
    }

    // Calculate total price
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    let totalPrice = 0
    if (item.pricePerDay) {
      totalPrice = item.pricePerDay * diffDays
    }

    // Create rental
    const rental = await prisma.rental.create({
      data: {
        itemId,
        ownerId: item.userId,
        renterId: session.user.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalPrice,
        depositPaid: item.deposit || 0,
        status: 'pending',
      },
      include: {
        item: {
          include: {
            images: {
              orderBy: { order: 'asc' },
              take: 1,
            },
            category: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        renter: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    })

    // Send notification email to owner about new rental request
    try {
      await sendNewRentalRequestEmail(rental as any)
      logger.info(`Rental request email sent to owner: ${rental.owner.id}`)
    } catch (emailError) {
      logger.error('Failed to send rental request email:', emailError)
    }

    // Schedule rental reminder email for 1 day before start date
    try {
      const jobQueue = await getJobQueue()
      const reminderDate = new Date(rental.startDate)
      reminderDate.setDate(reminderDate.getDate() - 1)
      reminderDate.setHours(9, 0, 0, 0) // 9 AM reminder

      if (reminderDate > new Date()) {
        await jobQueue.scheduleRentalReminder(rental.id, reminderDate)
        logger.info(`Rental reminder scheduled for ${reminderDate.toISOString()}`)
      }
    } catch (jobError) {
      logger.error('Failed to schedule rental reminder:', jobError)
    }

    // Schedule review request email for 1 day after end date
    try {
      const jobQueue = await getJobQueue()
      const reviewRequestDate = new Date(rental.endDate)
      reviewRequestDate.setDate(reviewRequestDate.getDate() + 1)
      reviewRequestDate.setHours(10, 0, 0, 0) // 10 AM review request

      await jobQueue.scheduleReviewRequest(rental.id, reviewRequestDate)
      logger.info(`Review request scheduled for ${reviewRequestDate.toISOString()}`)
    } catch (jobError) {
      logger.error('Failed to schedule review request:', jobError)
    }

    return NextResponse.json(rental, { status: 201 })
  } catch (error) {
    console.error("Error creating rental:", error)
    return NextResponse.json(
      { error: "Failed to create rental" },
      { status: 500 }
    )
  }
}