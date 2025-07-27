import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.item.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            bio: true,
            createdAt: true,
          },
        },
        category: true,
        images: {
          orderBy: { order: 'asc' },
        },
        rentals: {
          where: {
            status: {
              in: ['confirmed', 'active'],
            },
          },
          select: {
            startDate: true,
            endDate: true,
          },
        },
      },
    })

    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error fetching item:", error)
    return NextResponse.json(
      { error: "Failed to fetch item" },
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

    // Check if the user owns the item
    const existingItem = await prisma.item.findUnique({
      where: { id: params.id },
      select: { userId: true },
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      )
    }

    if (existingItem.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      categoryId,
      condition,
      pricePerDay,
      pricePerHour,
      deposit,
      location,
      latitude,
      longitude,
      available,
      imageUrls,
    } = body

    // Update item
    const item = await prisma.item.update({
      where: { id: params.id },
      data: {
        title,
        description,
        categoryId,
        condition,
        pricePerDay: pricePerDay ? parseFloat(pricePerDay) : null,
        pricePerHour: pricePerHour ? parseFloat(pricePerHour) : null,
        deposit: deposit ? parseFloat(deposit) : null,
        location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        available,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        category: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
    })

    // Update images if provided
    if (imageUrls && Array.isArray(imageUrls)) {
      // Delete existing images
      await prisma.itemImage.deleteMany({
        where: { itemId: params.id },
      })

      // Create new images
      await prisma.itemImage.createMany({
        data: imageUrls.map((url: string, index: number) => ({
          url,
          order: index,
          itemId: params.id,
        })),
      })

      // Fetch updated item with new images
      const updatedItem = await prisma.item.findUnique({
        where: { id: params.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          category: true,
          images: {
            orderBy: { order: 'asc' },
          },
        },
      })

      return NextResponse.json(updatedItem)
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error updating item:", error)
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Check if the user owns the item
    const existingItem = await prisma.item.findUnique({
      where: { id: params.id },
      select: { userId: true },
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      )
    }

    if (existingItem.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    // Check if there are active rentals
    const activeRentals = await prisma.rental.count({
      where: {
        itemId: params.id,
        status: {
          in: ['confirmed', 'active'],
        },
      },
    })

    if (activeRentals > 0) {
      return NextResponse.json(
        { error: "Cannot delete item with active rentals" },
        { status: 400 }
      )
    }

    await prisma.item.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting item:", error)
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    )
  }
}