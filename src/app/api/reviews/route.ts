import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const rentalId = searchParams.get("rentalId")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const where: any = {}

    if (userId) {
      where.reviewedId = userId
    }

    if (rentalId) {
      where.rentalId = rentalId
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          rental: {
            include: {
              item: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({ where }),
    ])

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
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
    const { rentalId, rating, comment } = body

    if (!rentalId || !rating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    // Fetch rental details
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: {
        owner: true,
        renter: true,
      },
    })

    if (!rental) {
      return NextResponse.json(
        { error: "Rental not found" },
        { status: 404 }
      )
    }

    // Check if user is part of the rental
    if (rental.ownerId !== session.user.id && rental.renterId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only review rentals you're part of" },
        { status: 403 }
      )
    }

    // Check if rental is completed
    if (rental.status !== 'completed') {
      return NextResponse.json(
        { error: "You can only review completed rentals" },
        { status: 400 }
      )
    }

    // Determine who is being reviewed
    const reviewedId = session.user.id === rental.ownerId 
      ? rental.renterId 
      : rental.ownerId

    // Check if already reviewed
    const existingReview = await prisma.review.findFirst({
      where: {
        rentalId,
        reviewerId: session.user.id,
        reviewedId,
      },
    })

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this rental" },
        { status: 400 }
      )
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        rentalId,
        reviewerId: session.user.id,
        reviewedId,
        rating,
        comment,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    )
  }
}