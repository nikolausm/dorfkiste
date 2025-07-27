import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

// Initialize Stripe with secret key from platform settings
export async function getStripe(): Promise<Stripe | null> {
  try {
    const settings = await prisma.platformSettings.findFirst()
    if (!settings?.stripeSecretKey) {
      console.error('Stripe secret key not configured')
      return null
    }
    
    return new Stripe(settings.stripeSecretKey, {
      apiVersion: '2025-06-30.basil',
      typescript: true,
    })
  } catch (error) {
    console.error('Error initializing Stripe:', error)
    return null
  }
}

// Create Stripe customer for user
export async function createStripeCustomer(userId: string, email: string, name?: string) {
  const stripe = await getStripe()
  if (!stripe) throw new Error('Stripe not configured')

  try {
    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
      metadata: {
        userId,
      },
    })

    // Update user with Stripe customer ID
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    })

    return customer
  } catch (error) {
    console.error('Error creating Stripe customer:', error)
    throw error
  }
}

// Create payment intent for rental
export async function createPaymentIntent(
  rentalId: string,
  amount: number,
  customerId?: string,
  metadata?: Record<string, string>
) {
  const stripe = await getStripe()
  if (!stripe) throw new Error('Stripe not configured')

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'eur',
      customer: customerId,
      metadata: {
        rentalId,
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    // Create payment record
    await prisma.payment.create({
      data: {
        amount,
        currency: 'EUR',
        status: 'pending',
        type: 'rental_payment',
        method: 'stripe',
        stripePaymentIntentId: paymentIntent.id,
        rentalId,
        userId: metadata?.userId || '',
      },
    })

    return paymentIntent
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw error
  }
}

// Process refund
export async function processRefund(paymentIntentId: string, amount?: number) {
  const stripe = await getStripe()
  if (!stripe) throw new Error('Stripe not configured')

  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    })

    // Update payment status
    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: paymentIntentId },
      data: { status: 'refunded' },
    })

    return refund
  } catch (error) {
    console.error('Error processing refund:', error)
    throw error
  }
}

// Create payout for owner
export async function createPayout(userId: string, amount: number) {
  const stripe = await getStripe()
  if (!stripe) throw new Error('Stripe not configured')

  try {
    // Get user's Stripe account ID (would need to implement Stripe Connect)
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user?.stripeCustomerId) {
      throw new Error('User has no Stripe account')
    }

    // Note: This would require Stripe Connect implementation
    // For now, just create a payout record
    const payout = await prisma.payout.create({
      data: {
        amount,
        currency: 'EUR',
        status: 'pending',
        method: 'stripe',
        userId,
      },
    })

    return payout
  } catch (error) {
    console.error('Error creating payout:', error)
    throw error
  }
}

// Verify webhook signature
export async function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event | null> {
  const stripe = await getStripe()
  if (!stripe) return null

  try {
    const settings = await prisma.platformSettings.findFirst()
    if (!settings?.stripeWebhookSecret) {
      console.error('Stripe webhook secret not configured')
      return null
    }

    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      settings.stripeWebhookSecret
    )

    return event
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return null
  }
}

// Handle successful payment
export async function handleSuccessfulPayment(paymentIntentId: string) {
  try {
    // Update payment status
    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: paymentIntentId },
      data: { status: 'succeeded' },
    })

    // Get the updated payment with rental info
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
      include: { rental: true },
    })

    // Update rental status
    if (payment?.rentalId) {
      await prisma.rental.update({
        where: { id: payment.rentalId },
        data: {
          paymentStatus: 'paid',
          status: 'confirmed',
        },
      })
    }

    return payment
  } catch (error) {
    console.error('Error handling successful payment:', error)
    throw error
  }
}

// Calculate platform fee
export async function calculatePlatformFee(amount: number): Promise<number> {
  const settings = await prisma.platformSettings.findFirst()
  const feePercentage = settings?.platformFeePercentage || 10
  return (amount * feePercentage) / 100
}