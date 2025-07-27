import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createStripeCustomer, createPaymentIntent, calculatePlatformFee } from '@/lib/stripe'
import { 
  paymentIntentSchema, 
  createValidationMiddleware,
  createValidationErrorResponse
} from '@/lib/validation'
import { log, PerformanceTimer } from '@/lib/logger'

export async function POST(request: Request) {
  const timer = new PerformanceTimer();
  
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      log.security('Unauthorized payment intent creation attempt', {
        hasSession: !!session,
        hasUser: !!session?.user,
        hasEmail: !!session?.user?.email,
        type: 'payment_unauthorized'
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate request body
    const validatePayment = createValidationMiddleware(paymentIntentSchema)
    const validation = await validatePayment(request as any, 'body')
    
    if (!validation.success) {
      log.warn('Invalid payment intent data', {
        userId: session.user.id,
        email: session.user.email,
        errors: validation.errors,
        type: 'payment_validation_error'
      });
      return createValidationErrorResponse(validation.errors!)
    }

    const { rentalId, amount, paymentMethod } = validation.data!
    
    log.payment('Payment intent creation started', {
      userId: session.user.id,
      email: session.user.email,
      rentalId,
      amount,
      paymentMethod,
      type: 'payment_intent_start'
    });

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      log.error('User not found during payment intent creation', {
        email: session.user.email,
        sessionUserId: session.user.id,
        type: 'payment_user_not_found'
      });
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get rental details
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: { item: true }
    })

    if (!rental) {
      log.error('Rental not found during payment intent creation', {
        userId: user.id,
        rentalId,
        type: 'payment_rental_not_found'
      });
      return NextResponse.json({ error: 'Rental not found' }, { status: 404 })
    }

    if (rental.renterId !== user.id) {
      log.security('Unauthorized rental access attempt during payment', {
        userId: user.id,
        rentalId,
        actualRenterId: rental.renterId,
        type: 'payment_unauthorized_rental_access'
      });
      return NextResponse.json({ error: 'Rental not found' }, { status: 404 })
    }

    // Create Stripe customer if not exists
    let stripeCustomerId = user.stripeCustomerId
    if (!stripeCustomerId) {
      log.info('Creating new Stripe customer', {
        userId: user.id,
        email: user.email,
        type: 'stripe_customer_creation'
      });
      const customer = await createStripeCustomer(user.id, user.email, user.name || undefined)
      stripeCustomerId = customer.id
      
      log.info('Stripe customer created successfully', {
        userId: user.id,
        stripeCustomerId,
        type: 'stripe_customer_created'
      });
    }

    // Calculate platform fee
    const platformFee = await calculatePlatformFee(amount)
    
    log.debug('Platform fee calculated', {
      userId: user.id,
      rentalId,
      amount,
      platformFee,
      type: 'platform_fee_calculation'
    });

    // Update rental with platform fee
    await prisma.rental.update({
      where: { id: rentalId },
      data: { platformFee }
    })

    // Create payment intent
    const paymentIntent = await createPaymentIntent(
      rentalId,
      amount,
      stripeCustomerId,
      {
        userId: user.id,
        itemId: rental.itemId,
        ownerId: rental.ownerId
      }
    )

    timer.end('Payment intent created successfully', {
      userId: user.id,
      rentalId,
      amount,
      platformFee,
      stripeCustomerId,
      paymentIntentId: paymentIntent.id,
      type: 'payment_intent_success'
    });

    log.payment('Payment intent created successfully', {
      userId: user.id,
      rentalId,
      amount,
      platformFee,
      stripeCustomerId,
      paymentIntentId: paymentIntent.id,
      itemId: rental.itemId,
      ownerId: rental.ownerId,
      type: 'payment_intent_created'
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret
    })
  } catch (error) {
    timer.end('Payment intent creation failed', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      type: 'payment_intent_error'
    });

    log.error('Error creating payment intent', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      type: 'payment_intent_error'
    });

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}