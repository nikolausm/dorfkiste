import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { updateItemSchemaEnhanced } from "@/lib/validations/items-enhanced"
import { apiRateLimit } from "@/lib/security/rate-limit"
import { 
  ApiErrors, 
  createErrorResponse, 
  withApiErrorHandling,
  RequestSizeLimits 
} from "@/lib/api-errors"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const item = await prisma.item.findUnique({
      where: { id },
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

export const PUT = withApiErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const session = await auth()
  
  if (!session?.user?.id) {
    throw ApiErrors.unauthorized()
  }

  // Check request size
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > RequestSizeLimits.JSON_MAX_SIZE) {
    throw ApiErrors.invalidInput('request', 'Request payload too large')
  }

  // Apply rate limiting
  const rateLimitResponse = await apiRateLimit(request, session.user.id)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  // Check if the user owns the item
  const existingItem = await prisma.item.findUnique({
    where: { id: id },
    select: { userId: true },
  })

  if (!existingItem) {
    throw ApiErrors.notFound('Item')
  }

  if (existingItem.userId !== session.user.id) {
    throw ApiErrors.forbidden('You do not have permission to update this item')
  }

  // Parse and validate request body
  let body: any
  try {
    body = await request.json()
  } catch (error) {
    throw ApiErrors.invalidInput('body', 'Invalid JSON in request body')
  }
  
  // Validate request body with enhanced schema
  const validatedData = updateItemSchemaEnhanced.parse(body)

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
    deliveryOption,
    deliveryAvailable,
    deliveryFee,
    deliveryRadius,
    deliveryDetails,
    pickupAvailable,
    pickupDetails,
    imageUrls,
  } = validatedData

  // Update item with validated and sanitized data
  const updateData: any = {
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(categoryId !== undefined && { categoryId }),
    ...(condition !== undefined && { condition }),
    ...(pricePerDay !== undefined && { pricePerDay }),
    ...(pricePerHour !== undefined && { pricePerHour }),
    ...(deposit !== undefined && { deposit }),
    ...(location !== undefined && { location }),
    ...(latitude !== undefined && { latitude }),
    ...(longitude !== undefined && { longitude }),
    ...(available !== undefined && { available }),
    ...(deliveryOption !== undefined && { deliveryOption }),
    ...(deliveryAvailable !== undefined && { deliveryAvailable }),
    ...(deliveryFee !== undefined && { deliveryFee }),
    ...(deliveryRadius !== undefined && { deliveryRadius }),
    ...(deliveryDetails !== undefined && { deliveryDetails }),
    ...(pickupAvailable !== undefined && { pickupAvailable }),
    ...(pickupDetails !== undefined && { pickupDetails }),
  }

  const item = await prisma.item.update({
    where: { id: id },
    data: updateData,
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
        where: { itemId: id },
      })

      // Create new images
      await prisma.itemImage.createMany({
        data: imageUrls.map((url: string, index: number) => ({
          url,
          order: index,
          itemId: id,
        })),
      })

      // Fetch updated item with new images
      const updatedItem = await prisma.item.findUnique({
        where: { id: id },
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
})

export const DELETE = withApiErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const session = await auth()
  
  if (!session?.user?.id) {
    throw ApiErrors.unauthorized()
  }

  // Apply rate limiting
  const rateLimitResponse = await apiRateLimit(request, session.user.id)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  // Check if the user owns the item
  const existingItem = await prisma.item.findUnique({
    where: { id: id },
    select: { userId: true },
  })

  if (!existingItem) {
    throw ApiErrors.notFound('Item')
  }

  if (existingItem.userId !== session.user.id) {
    throw ApiErrors.forbidden('You do not have permission to delete this item')
  }

  // Check if there are active rentals
  const activeRentals = await prisma.rental.count({
    where: {
      itemId: id,
      status: {
        in: ['confirmed', 'active'],
      },
    },
  })

  if (activeRentals > 0) {
    throw ApiErrors.conflict('Cannot delete item with active rentals')
  }

  await prisma.item.delete({
    where: { id: id },
  })

  return NextResponse.json({ 
    success: true,
    message: 'Item deleted successfully' 
  })
})