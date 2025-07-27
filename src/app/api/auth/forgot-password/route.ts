import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'E-Mail-Adresse ist erforderlich' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: typeof email === 'string' ? email.toLowerCase() : email },
      select: { id: true, email: true, name: true }
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: 'Wenn diese E-Mail-Adresse in unserem System registriert ist, erhalten Sie in Kürze eine E-Mail mit weiteren Anweisungen.'
      })
    }

    // Delete any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    })

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')

    // Create new reset token (expires in 1 hour)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)

    await prisma.passwordResetToken.create({
      data: {
        token: hashedToken,
        userId: user.id,
        expiresAt
      }
    })

    // Generate reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`

    // Send email
    try {
      await sendPasswordResetEmail(user.email, resetUrl, user.name || undefined)
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError)
      // Delete the token if email fails
      await prisma.passwordResetToken.delete({
        where: { token: hashedToken }
      })
      return NextResponse.json(
        { error: 'Fehler beim Senden der E-Mail. Bitte versuchen Sie es später erneut.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Wenn diese E-Mail-Adresse in unserem System registriert ist, erhalten Sie in Kürze eine E-Mail mit weiteren Anweisungen.'
    })
  } catch (error) {
    console.error('Password reset request error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' },
      { status: 500 }
    )
  }
}