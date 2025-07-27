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
    const rentalId = searchParams.get("rentalId")

    if (!rentalId) {
      return NextResponse.json(
        { error: "Rental ID is required" },
        { status: 400 }
      )
    }

    // Check if user is part of the rental
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      select: {
        ownerId: true,
        renterId: true,
      },
    })

    if (!rental) {
      return NextResponse.json(
        { error: "Rental not found" },
        { status: 404 }
      )
    }

    if (rental.ownerId !== session.user.id && rental.renterId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const messages = await prisma.message.findMany({
      where: { rentalId },
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
    })

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        rentalId,
        senderId: { not: session.user.id },
        read: false,
      },
      data: { read: true },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { error: "Failed to fetch messages" },
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
    const { rentalId, content } = body

    if (!rentalId || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if user is part of the rental
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      select: {
        ownerId: true,
        renterId: true,
      },
    })

    if (!rental) {
      return NextResponse.json(
        { error: "Rental not found" },
        { status: 404 }
      )
    }

    if (rental.ownerId !== session.user.id && rental.renterId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        rentalId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    )
  }
}