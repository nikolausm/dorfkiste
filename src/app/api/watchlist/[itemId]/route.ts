import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: Request,
  context: { params: Promise<{ itemId: string }> }
) {
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

    const { itemId } = await context.params

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 })
    }

    // Remove from watchlist
    const deletedWatchlistItem = await prisma.watchlistItem.deleteMany({
      where: {
        userId: user.id,
        itemId: itemId
      }
    })

    if (deletedWatchlistItem.count === 0) {
      return NextResponse.json({ error: "Item not found in watchlist" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing from watchlist:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}