import { prisma } from '@/lib/prisma'

interface PayPalConfig {
  clientId: string
  clientSecret: string
  mode: 'sandbox' | 'live'
}

// Get PayPal configuration from platform settings
async function getPayPalConfig(): Promise<PayPalConfig | null> {
  try {
    const settings = await prisma.platformSettings.findFirst()
    if (!settings?.paypalClientId || !settings?.paypalClientSecret) {
      console.error('PayPal not configured')
      return null
    }
    
    return {
      clientId: settings.paypalClientId,
      clientSecret: settings.paypalClientSecret,
      mode: (settings.paypalMode as 'sandbox' | 'live') || 'sandbox',
    }
  } catch (error) {
    console.error('Error getting PayPal config:', error)
    return null
  }
}

// Get PayPal access token
async function getAccessToken(): Promise<string | null> {
  const config = await getPayPalConfig()
  if (!config) return null

  const baseURL = config.mode === 'live' 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com'

  try {
    const auth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')
    
    const response = await fetch(`${baseURL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    if (!response.ok) {
      throw new Error('Failed to get PayPal access token')
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Error getting PayPal access token:', error)
    return null
  }
}

// Create PayPal order
export async function createPayPalOrder(
  rentalId: string,
  amount: number,
  metadata?: Record<string, string>
) {
  const config = await getPayPalConfig()
  if (!config) throw new Error('PayPal not configured')

  const accessToken = await getAccessToken()
  if (!accessToken) throw new Error('Failed to authenticate with PayPal')

  const baseURL = config.mode === 'live' 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com'

  try {
    const response = await fetch(`${baseURL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: rentalId,
          amount: {
            currency_code: 'EUR',
            value: amount.toFixed(2),
          },
          description: `Rental payment for ${rentalId}`,
        }],
        application_context: {
          brand_name: 'Dorfkiste',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel`,
        },
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create PayPal order')
    }

    const order = await response.json()

    // Create payment record
    await prisma.payment.create({
      data: {
        amount,
        currency: 'EUR',
        status: 'pending',
        type: 'rental_payment',
        method: 'paypal',
        paypalPaymentId: order.id,
        rentalId,
        userId: metadata?.userId || '',
      },
    })

    return order
  } catch (error) {
    console.error('Error creating PayPal order:', error)
    throw error
  }
}

// Capture PayPal order
export async function capturePayPalOrder(orderId: string) {
  const config = await getPayPalConfig()
  if (!config) throw new Error('PayPal not configured')

  const accessToken = await getAccessToken()
  if (!accessToken) throw new Error('Failed to authenticate with PayPal')

  const baseURL = config.mode === 'live' 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com'

  try {
    const response = await fetch(`${baseURL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to capture PayPal order')
    }

    const captureData = await response.json()

    // Update payment status
    const payment = await prisma.payment.updateMany({
      where: { paypalPaymentId: orderId },
      data: { status: 'succeeded' },
    })

    // Get the updated payment with rental info
    const updatedPayment = await prisma.payment.findFirst({
      where: { paypalPaymentId: orderId },
      include: { rental: true },
    })

    // Update rental status
    if (updatedPayment?.rentalId) {
      await prisma.rental.update({
        where: { id: updatedPayment.rentalId },
        data: {
          paymentStatus: 'paid',
          status: 'confirmed',
          paypalOrderId: orderId,
        },
      })
    }

    return captureData
  } catch (error) {
    console.error('Error capturing PayPal order:', error)
    throw error
  }
}

// Process PayPal refund
export async function processPayPalRefund(captureId: string, amount?: number) {
  const config = await getPayPalConfig()
  if (!config) throw new Error('PayPal not configured')

  const accessToken = await getAccessToken()
  if (!accessToken) throw new Error('Failed to authenticate with PayPal')

  const baseURL = config.mode === 'live' 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com'

  try {
    const body: any = {}
    if (amount) {
      body.amount = {
        currency_code: 'EUR',
        value: amount.toFixed(2),
      }
    }

    const response = await fetch(`${baseURL}/v2/payments/captures/${captureId}/refund`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error('Failed to process PayPal refund')
    }

    const refundData = await response.json()

    // Update payment status
    await prisma.payment.updateMany({
      where: { paypalPaymentId: captureId },
      data: { status: 'refunded' },
    })

    return refundData
  } catch (error) {
    console.error('Error processing PayPal refund:', error)
    throw error
  }
}

// Create PayPal payout
export async function createPayPalPayout(userId: string, amount: number) {
  const config = await getPayPalConfig()
  if (!config) throw new Error('PayPal not configured')

  const accessToken = await getAccessToken()
  if (!accessToken) throw new Error('Failed to authenticate with PayPal')

  try {
    // Get user's PayPal email
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user?.paypalEmail) {
      throw new Error('User has no PayPal email configured')
    }

    const baseURL = config.mode === 'live' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com'

    const response = await fetch(`${baseURL}/v1/payments/payouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender_batch_header: {
          sender_batch_id: `payout_${Date.now()}`,
          email_subject: 'Dorfkiste Auszahlung',
          email_message: 'Sie haben eine Auszahlung von Dorfkiste erhalten',
        },
        items: [{
          recipient_type: 'EMAIL',
          receiver: user.paypalEmail,
          amount: {
            currency: 'EUR',
            value: amount.toFixed(2),
          },
          note: 'Dorfkiste Vermietungseinnahmen',
          sender_item_id: `${userId}_${Date.now()}`,
        }],
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create PayPal payout')
    }

    const payoutData = await response.json()

    // Create payout record
    const payout = await prisma.payout.create({
      data: {
        amount,
        currency: 'EUR',
        status: 'processing',
        method: 'paypal',
        paypalPayoutId: payoutData.batch_header.payout_batch_id,
        userId,
      },
    })

    return payout
  } catch (error) {
    console.error('Error creating PayPal payout:', error)
    throw error
  }
}

// Verify PayPal webhook
export async function verifyPayPalWebhook(
  headers: Record<string, string>,
  body: any
): Promise<boolean> {
  const config = await getPayPalConfig()
  if (!config) return false

  const accessToken = await getAccessToken()
  if (!accessToken) return false

  const baseURL = config.mode === 'live' 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com'

  try {
    const response = await fetch(`${baseURL}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: process.env.PAYPAL_WEBHOOK_ID,
        webhook_event: body,
      }),
    })

    if (!response.ok) {
      return false
    }

    const verification = await response.json()
    return verification.verification_status === 'SUCCESS'
  } catch (error) {
    console.error('Error verifying PayPal webhook:', error)
    return false
  }
}