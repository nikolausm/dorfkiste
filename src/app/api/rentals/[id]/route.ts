import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const rental = await prisma.rental.findUnique({
      where: { id: params.id },
      include: {
        item: {
          include: {
            images: {
              orderBy: { order: 'asc' },
            },
            category: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            email: true,
          },
        },
        renter: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            email: true,
          },
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
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
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    return NextResponse.json(rental)
  } catch (error) {
    console.error("Error fetching rental:", error)
    return NextResponse.json(
      { error: "Failed to fetch rental" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const rental = await prisma.rental.findUnique({
      where: { id: params.id },
      select: {
        ownerId: true,
        renterId: true,
        status: true,
      },
    })

    if (!rental) {
      return NextResponse.json(
        { error: "Rental not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { status } = body

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['active', 'cancelled'],
      active: ['completed'],
      completed: [],
      cancelled: [],
    }

    if (!validTransitions[rental.status]?.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status transition" },
        { status: 400 }
      )
    }

    // Check permissions for status changes
    if (status === 'confirmed' && rental.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the owner can confirm a rental" },
        { status: 403 }
      )
    }

    if (status === 'cancelled') {
      // Both owner and renter can cancel
      if (rental.ownerId !== session.user.id && rental.renterId !== session.user.id) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        )
      }
    }

    if (status === 'active' && rental.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the owner can mark a rental as active" },
        { status: 403 }
      )
    }

    if (status === 'completed' && rental.renterId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the renter can mark a rental as completed" },
        { status: 403 }
      )
    }

    const updatedRental = await prisma.rental.update({
      where: { id: params.id },
      data: { status },
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

    return NextResponse.json(updatedRental)
  } catch (error) {
    console.error("Error updating rental:", error)
    return NextResponse.json(
      { error: "Failed to update rental" },
      { status: 500 }
    )
  }
}