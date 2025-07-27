import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Find all rentals where the user is involved
    const userRentals = await prisma.rental.findMany({
      where: {
        OR: [
          { ownerId: session.user.id },
          { renterId: session.user.id },
        ],
      },
      select: { id: true },
    })

    const rentalIds = userRentals.map(rental => rental.id)

    // Find unread messages in those rentals
    const unreadMessages = await prisma.message.findMany({
      where: {
        rentalId: { in: rentalIds },
        senderId: { not: session.user.id },
        read: false,
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
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(unreadMessages)
  } catch (error) {
    console.error("Error fetching unread messages:", error)
    return NextResponse.json(
      { error: "Failed to fetch unread messages" },
      { status: 500 }
    )
  }
}