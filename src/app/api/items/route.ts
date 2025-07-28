import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { 
  itemSearchSchemaEnhanced,
  createItemSchemaEnhanced 
} from "@/lib/validations/items-enhanced"
import { 
  ApiErrors, 
  createErrorResponse, 
  withApiErrorHandling,
  RequestSizeLimits 
} from "@/lib/api-errors"
import { apiRateLimit, searchRateLimit } from "@/lib/security/rate-limit"
import { log } from "@/lib/logger"

export const GET = withApiErrorHandling(async (request: NextRequest) => {
  // Apply rate limiting for search endpoints
  const rateLimitResponse = await searchRateLimit(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const { searchParams } = new URL(request.url)
  
  // Build query object for validation
  const queryData = {
    query: searchParams.get("search") || searchParams.get("q") || undefined,
    category: searchParams.get("category") || undefined,
    categoryId: searchParams.get("categoryId") || undefined,
    location: searchParams.get("location") || undefined,
    minPrice: searchParams.get("minPrice") || undefined,
    maxPrice: searchParams.get("maxPrice") || undefined,
    available: searchParams.get("available") || undefined,
    deliveryAvailable: searchParams.get("deliveryAvailable") || undefined,
    radius: searchParams.get("radius") || undefined,
    page: searchParams.get("page") || "1",
    limit: searchParams.get("limit") || "20",
    sortBy: searchParams.get("sortBy") || searchParams.get("sort") || "created",
    sortOrder: searchParams.get("sortOrder") || searchParams.get("order") || "desc",
    userId: searchParams.get("userId") || undefined,
  }

  // Validate query parameters with enhanced schema
  const validatedData = itemSearchSchemaEnhanced.parse(queryData)

  const {
    query,
    category: categoryFilter,
    categoryId: categoryIdFilter,
    location: locationFilter,
    minPrice,
    maxPrice,
    available,
    deliveryAvailable,
    radius,
    page,
    limit,
    sortBy,
    sortOrder,
    userId
  } = validatedData
  
  const skip = (page - 1) * limit

  const where: any = {}

  // Category filter - prefer categoryId over category name
  if (categoryIdFilter) {
    where.categoryId = categoryIdFilter
  } else if (categoryFilter) {
    // If category name is provided, find category
    const category = await prisma.category.findFirst({
      where: { 
        name: { 
          contains: categoryFilter, 
          mode: 'insensitive' 
        } 
      }
    })
    if (category) {
      where.categoryId = category.id
    }
  }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ]
    }

    if (locationFilter) {
      where.location = { contains: locationFilter, mode: 'insensitive' }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.pricePerDay = {}
      if (minPrice !== undefined) where.pricePerDay.gte = minPrice
      if (maxPrice !== undefined) where.pricePerDay.lte = maxPrice
    }

    // Handle condition filter
    const conditionParam = searchParams.get("condition")
    if (conditionParam) {
      const conditions = conditionParam.split(",")
      where.condition = { in: conditions }
    }

    // Handle availability filter
    const availabilityParam = searchParams.get("availability")
    if (availabilityParam) {
      const availabilityOptions = availabilityParam.split(",")
      if (!availabilityOptions.includes("all")) {
        where.available = true
      }
    } else if (available !== undefined) {
      where.available = available
    }
    
    // Delivery availability filter
    if (deliveryAvailable !== undefined) {
      where.deliveryAvailable = deliveryAvailable
    }

    if (userId) {
      where.userId = userId
    }

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' }
    if (sortBy === 'price' || sortBy === 'price-low') {
      orderBy = { pricePerDay: 'asc' }
    } else if (sortBy === 'price-high') {
      orderBy = { pricePerDay: 'desc' }
    } else if (sortBy === 'name') {
      orderBy = { title: sortOrder }
    } else if (sortBy === 'location') {
      orderBy = { location: sortOrder }
    } else if (sortBy === 'newest') {
      orderBy = { createdAt: 'desc' }
    } else if (sortBy === 'popular') {
      // For now, use createdAt but this could be based on view count or rental count
      orderBy = { createdAt: 'desc' }
    }

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        skip,
        take: limit,
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
        orderBy,
      }),
      prisma.item.count({ where }),
    ])

  // Log search query for analytics
  if (query || categoryFilter || locationFilter) {
    log.info('Search query executed', {
      query,
      category: categoryFilter,
      location: locationFilter,
      results: total,
      page,
    })
  }

  return NextResponse.json({
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1,
  })
})

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  const session = await auth()
  
  if (!session?.user?.email) {
    throw ApiErrors.unauthorized()
  }

  // Check request size
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > RequestSizeLimits.JSON_MAX_SIZE) {
    throw ApiErrors.invalidInput('request', 'Request payload too large')
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) {
    throw ApiErrors.notFound('User')
  }

  // Apply rate limiting
  const rateLimitResponse = await apiRateLimit(request, user.id)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  // Parse and validate request body
  let body: any
  try {
    body = await request.json()
  } catch (error) {
    throw ApiErrors.invalidInput('body', 'Invalid JSON in request body')
  }
  
  // Validate with enhanced schema
  const validatedData = createItemSchemaEnhanced.parse(body)

  const {
    title,
    description,
    categoryId,
    pricePerDay,
    pricePerHour,
    deposit,
    location,
    latitude,
    longitude,
    condition,
    available,
    deliveryOption,
    deliveryAvailable,
    deliveryFee,
    deliveryRadius,
    deliveryDetails,
    pickupAvailable,
    pickupDetails,
    imageUrls
  } = validatedData

  // Verify category exists
  const category = await prisma.category.findUnique({
    where: { id: categoryId }
  })
  
  if (!category) {
    throw ApiErrors.invalidInput('categoryId', 'Invalid category')
  }

  const item = await prisma.item.create({
    data: {
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
      userId: user.id,
      images: {
        create: imageUrls?.map((url: string, index: number) => ({
          url,
          order: index,
        })) || [],
      },
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

  // Log item creation
  log.info('Item created', {
    itemId: item.id,
    userId: user.id,
    categoryId: item.categoryId,
    pricePerDay: item.pricePerDay,
    location: item.location,
  })

  return NextResponse.json(item, { status: 201 })
})