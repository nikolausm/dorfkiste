import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { 
  itemSearchSchema,
  itemCreateSchema, 
  createValidationMiddleware,
  createValidationErrorResponse,
  validateData
} from "@/lib/validation"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Build query object for validation
    const queryData = {
      query: searchParams.get("search") || undefined,
      category: searchParams.get("categoryId") || undefined,
      location: searchParams.get("location") || undefined,
      minPrice: searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined,
      maxPrice: searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined,
      available: searchParams.get("available") ? searchParams.get("available") === "true" : undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 20,
      sortBy: searchParams.get("sortBy") as any || "created",
      sortOrder: searchParams.get("sortOrder") as any || "desc"
    }

    // Validate query parameters
    const validation = validateData(itemSearchSchema, queryData)
    
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors!)
    }

    const validatedData = validation.data!
    const query = validatedData.query
    const categoryFilter = validatedData.category  
    const locationFilter = validatedData.location
    const { minPrice, maxPrice, available, page, limit, sortBy, sortOrder } = validatedData
    const userId = searchParams.get("userId") // Keep userId for internal filtering
    const skip = (page - 1) * limit

    const where: any = {}

    if (categoryFilter) {
      where.categoryId = categoryFilter
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

    if (available !== undefined) {
      where.available = available
    }

    if (userId) {
      where.userId = userId
    }

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' }
    if (sortBy === 'price') {
      orderBy = { pricePerDay: sortOrder }
    } else if (sortBy === 'name') {
      orderBy = { title: sortOrder }
    } else if (sortBy === 'location') {
      orderBy = { location: sortOrder }
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

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching items:", error)
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Validate request body
    const validateCreate = createValidationMiddleware(itemCreateSchema)
    const validation = await validateCreate(request, 'body')
    
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors!)
    }

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
      deliveryAvailable,
      deliveryFee,
      deliveryRadius,
      deliveryDetails,
      pickupAvailable,
      imageUrls
    } = validation.data!

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
        deliveryAvailable,
        deliveryFee,
        deliveryRadius,
        deliveryDetails,
        pickupAvailable,
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

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error("Error creating item:", error)
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    )
  }
}