import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { capturePayPalOrder } from '@/lib/paypal'

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, payerId } = body

    if (!orderId || !payerId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Capture PayPal order
    const captureData = await capturePayPalOrder(orderId)

    // Get the rental ID from the capture data
    const rentalId = captureData.purchase_units?.[0]?.reference_id

    return NextResponse.json({
      success: true,
      rentalId,
      captureData
    })
  } catch (error) {
    console.error('Error capturing PayPal order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}