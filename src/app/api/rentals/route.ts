import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

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
    const role = searchParams.get("role") // 'renter' or 'owner'
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
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

    const body = await request.json()
    const { itemId, startDate, endDate } = body

    if (!itemId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

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

    return NextResponse.json(rental, { status: 201 })
  } catch (error) {
    console.error("Error creating rental:", error)
    return NextResponse.json(
      { error: "Failed to create rental" },
      { status: 500 }
    )
  }
}