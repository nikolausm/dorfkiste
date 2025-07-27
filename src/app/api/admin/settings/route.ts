import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get platform settings
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

    // Get or create platform settings
    let settings = await prisma.platformSettings.findFirst()
    
    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: {
          platformFeePercentage: 10,
          paypalMode: 'sandbox'
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update platform settings
export async function PUT(request: Request) {
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

    const body = await request.json()
    const {
      platformFeePercentage,
      stripeSecretKey,
      stripePublishableKey,
      stripeWebhookSecret,
      paypalClientId,
      paypalClientSecret,
      paypalMode
    } = body

    // Get existing settings
    let settings = await prisma.platformSettings.findFirst()

    if (settings) {
      // Update existing settings
      settings = await prisma.platformSettings.update({
        where: { id: settings.id },
        data: {
          platformFeePercentage: platformFeePercentage || settings.platformFeePercentage,
          stripeSecretKey: stripeSecretKey !== undefined ? stripeSecretKey : settings.stripeSecretKey,
          stripePublishableKey: stripePublishableKey !== undefined ? stripePublishableKey : settings.stripePublishableKey,
          stripeWebhookSecret: stripeWebhookSecret !== undefined ? stripeWebhookSecret : settings.stripeWebhookSecret,
          paypalClientId: paypalClientId !== undefined ? paypalClientId : settings.paypalClientId,
          paypalClientSecret: paypalClientSecret !== undefined ? paypalClientSecret : settings.paypalClientSecret,
          paypalMode: paypalMode || settings.paypalMode,
        }
      })
    } else {
      // Create new settings
      settings = await prisma.platformSettings.create({
        data: {
          platformFeePercentage: platformFeePercentage || 10,
          stripeSecretKey,
          stripePublishableKey,
          stripeWebhookSecret,
          paypalClientId,
          paypalClientSecret,
          paypalMode: paypalMode || 'sandbox',
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}