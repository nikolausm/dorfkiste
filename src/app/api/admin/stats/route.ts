import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true }
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get statistics
    const [
      totalUsers,
      totalItems,
      totalRentals,
      payments,
      pendingPayouts
    ] = await Promise.all([
      prisma.user.count(),
      prisma.item.count(),
      prisma.rental.count(),
      prisma.payment.findMany({
        where: { status: 'succeeded' },
        select: { amount: true }
      }),
      prisma.payout.findMany({
        where: { status: { in: ['pending', 'processing'] } },
        select: { amount: true }
      })
    ])

    // Calculate totals
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0)
    
    // Get platform settings for fee calculation
    const settings = await prisma.platformSettings.findFirst()
    const feePercentage = settings?.platformFeePercentage || 10
    const platformEarnings = totalRevenue * (feePercentage / 100)
    
    const pendingPayoutAmount = pendingPayouts.reduce((sum, payout) => sum + payout.amount, 0)

    return NextResponse.json({
      totalUsers,
      totalItems,
      totalRentals,
      totalRevenue,
      platformEarnings,
      pendingPayouts: pendingPayoutAmount
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}