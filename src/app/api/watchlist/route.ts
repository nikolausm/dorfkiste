import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const watchlistItems = await prisma.watchlistItem.findMany({
      where: {
        userId: user.id
      },
      include: {
        item: {
          include: {
            images: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(watchlistItems)
  } catch (error) {
    console.error("Error fetching watchlist:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { itemId } = await request.json()

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 })
    }

    // Check if item exists
    const item = await prisma.item.findUnique({
      where: { id: itemId }
    })

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    // Check if already in watchlist
    const existingWatchlistItem = await prisma.watchlistItem.findUnique({
      where: {
        userId_itemId: {
          userId: user.id,
          itemId: itemId
        }
      }
    })

    if (existingWatchlistItem) {
      return NextResponse.json({ error: "Item already in watchlist" }, { status: 400 })
    }

    // Add to watchlist
    const watchlistItem = await prisma.watchlistItem.create({
      data: {
        userId: user.id,
        itemId: itemId
      },
      include: {
        item: {
          include: {
            images: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(watchlistItem)
  } catch (error) {
    console.error("Error adding to watchlist:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}