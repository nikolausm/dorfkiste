import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")
    const search = searchParams.get("search")
    const available = searchParams.get("available")
    const userId = searchParams.get("userId")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const where: any = {}

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (available !== null) {
      where.available = available === "true"
    }

    if (userId) {
      where.userId = userId
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
        orderBy: { createdAt: 'desc' },
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
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
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
      imageUrls,
    } = body

    if (!title || !categoryId || !condition || !location) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const item = await prisma.item.create({
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
        userId: session.user.id,
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