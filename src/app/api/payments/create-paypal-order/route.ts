import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPayPalOrder } from '@/lib/paypal'
import { calculatePlatformFee } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { rentalId, amount } = body

    if (!rentalId || !amount) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get rental details
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: { item: true }
    })

    if (!rental || rental.renterId !== user.id) {
      return NextResponse.json({ error: 'Rental not found' }, { status: 404 })
    }

    // Calculate platform fee
    const platformFee = await calculatePlatformFee(amount)

    // Update rental with platform fee
    await prisma.rental.update({
      where: { id: rentalId },
      data: { platformFee }
    })

    // Create PayPal order
    const order = await createPayPalOrder(
      rentalId,
      amount,
      {
        userId: user.id,
        itemId: rental.itemId,
        ownerId: rental.ownerId
      }
    )

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error creating PayPal order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}