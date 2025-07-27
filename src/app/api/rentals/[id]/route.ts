import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { sendRentalConfirmationEmail } from "@/lib/email-service"
import { getWebSocketServer } from "@/lib/websocket-server"
import { logger } from "@/lib/logger"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const rental = await prisma.rental.findUnique({
      where: { id: id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const rental = await prisma.rental.findUnique({
      where: { id: id },
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
      where: { id: id },
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

    // Send notifications based on status change
    try {
      const wsServer = getWebSocketServer()
      
      if (status === 'confirmed') {
        // Send confirmation email to renter
        await sendRentalConfirmationEmail(updatedRental as any)
        logger.info(`Rental confirmation email sent to renter: ${updatedRental.renter.id}`)
        
        // Send real-time notification
        if (wsServer) {
          await wsServer.createNotification({
            userId: updatedRental.renterId,
            type: 'rental_confirmed',
            title: 'Buchung bestätigt!',
            message: `Ihre Buchung für "${updatedRental.item.name}" wurde bestätigt.`,
            data: { rentalId: updatedRental.id }
          })
          
          // Send rental update to all users in rental room
          wsServer.sendToRental(updatedRental.id, 'rental_updated', {
            rentalId: updatedRental.id,
            status: 'confirmed',
            timestamp: new Date()
          })
        }
      }
      
      if (status === 'completed') {
        // Notify owner that rental is completed
        if (wsServer) {
          await wsServer.createNotification({
            userId: updatedRental.ownerId,
            type: 'rental_confirmed',
            title: 'Miete abgeschlossen',
            message: `Die Miete von "${updatedRental.item.name}" wurde als abgeschlossen markiert.`,
            data: { rentalId: updatedRental.id }
          })
        }
      }
      
      if (status === 'cancelled') {
        // Notify the other party about cancellation
        const notifyUserId = rental.ownerId === session.user.id 
          ? updatedRental.renterId 
          : updatedRental.ownerId
          
        if (wsServer) {
          await wsServer.createNotification({
            userId: notifyUserId,
            type: 'rental_confirmed',
            title: 'Buchung storniert',
            message: `Die Buchung für "${updatedRental.item.name}" wurde storniert.`,
            data: { rentalId: updatedRental.id }
          })
        }
      }
    } catch (notificationError) {
      logger.error('Failed to send notifications:', notificationError)
      // Don't fail the request if notifications fail
    }

    return NextResponse.json(updatedRental)
  } catch (error) {
    console.error("Error updating rental:", error)
    return NextResponse.json(
      { error: "Failed to update rental" },
      { status: 500 }
    )
  }
}