import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { 
  userRegistrationSchema, 
  createValidationMiddleware,
  createValidationErrorResponse 
} from "@/lib/validation"
import { sendWelcomeEmail, sendAdminNotificationEmail } from "@/lib/email-service"
import { getJobQueue } from "@/lib/job-queue"
import { logger } from "@/lib/logger"
import { authRateLimit } from "@/lib/security/rate-limit"

const validateRegistration = createValidationMiddleware(userRegistrationSchema)

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await authRateLimit(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Validate request body
    const validation = await validateRegistration(request, 'body')
    
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors!)
    }

    const { name, email, password } = validation.data!

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "Ein Benutzer mit dieser E-Mail-Adresse existiert bereits" },
        { status: 400 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    // Send welcome email (async, don't wait)
    try {
      await sendWelcomeEmail(user)
      logger.info(`Welcome email sent to new user: ${user.email}`)
    } catch (emailError) {
      logger.error('Failed to send welcome email:', emailError)
      // Don't fail registration if email fails
    }

    // Send admin notification (async, don't wait)
    try {
      await sendAdminNotificationEmail('new_user', {
        name: user.name,
        email: user.email,
        id: user.id
      })
    } catch (adminEmailError) {
      logger.error('Failed to send admin notification:', adminEmailError)
    }

    // Schedule follow-up email for 24 hours later (via job queue)
    try {
      const jobQueue = await getJobQueue()
      await jobQueue.scheduleEmail(
        'sendWelcomeEmail',
        [{ ...user, name: user.name }],
        24 * 60 * 60 * 1000 // 24 hours in milliseconds
      )
    } catch (jobError) {
      logger.error('Failed to schedule follow-up email:', jobError)
    }

    return NextResponse.json(
      {
        message: "Benutzer erfolgreich erstellt",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { message: "Ein Fehler ist aufgetreten" },
      { status: 500 }
    )
  }
}