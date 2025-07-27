import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get platform settings
    const settings = await prisma.platformSettings.findFirst()
    
    if (!settings?.stripePublishableKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 })
    }

    return NextResponse.json({
      publishableKey: settings.stripePublishableKey
    })
  } catch (error) {
    console.error('Error fetching Stripe key:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}