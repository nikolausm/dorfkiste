import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { userUpdateSchema, validatePathParams } from "@/lib/validation"
import { 
  idParamSchema,
  withErrorHandling,
  validateRequestWithAuth
} from "@/lib/validation-middleware"

export const GET = withErrorHandling(async function(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  // Validate ID parameter
  const paramValidation = validatePathParams({ id }, idParamSchema)
  if (!paramValidation.success) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
  }
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        bio: true,
        verified: true,
        createdAt: true,
        _count: {
          select: {
            items: true,
            rentalsAsOwner: true,
            reviewsReceived: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Calculate average rating
    const reviews = await prisma.review.findMany({
      where: { reviewedId: id },
      select: { rating: true },
    })

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null

  return NextResponse.json({
    ...user,
    avgRating,
    totalReviews: reviews.length,
  })
})

export const PUT = withErrorHandling(async function(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  // Validate ID parameter
  const paramValidation = validatePathParams({ id }, idParamSchema)
  if (!paramValidation.success) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
  }

  // Validate authentication and request body
  const validation = await validateRequestWithAuth(request, userUpdateSchema)
  
  if (!validation.success) {
    return validation.response!
  }

  const { data: updateData, user } = validation

  // Check if user is updating their own profile or is admin
  if (user!.id !== id && !user!.isAdmin) {
    return NextResponse.json(
      { error: "Forbidden - Can only update own profile" },
      { status: 403 }
    )
  }

  const updatedUser = await prisma.user.update({
    where: { id: id },
    data: updateData!,
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return NextResponse.json(updatedUser)
})