import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetConfirmationEmail } from '@/lib/email'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token und Passwort sind erforderlich' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Das Passwort muss mindestens 6 Zeichen lang sein' },
        { status: 400 }
      )
    }

    // Hash the token to match stored version
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')

    // Find valid reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: hashedToken },
      include: { user: true }
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Ungültiger oder abgelaufener Reset-Link' },
        { status: 400 }
      )
    }

    // Check if token has expired
    if (resetToken.expiresAt < new Date()) {
      // Delete expired token
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id }
      })
      
      return NextResponse.json(
        { error: 'Der Reset-Link ist abgelaufen. Bitte fordern Sie einen neuen an.' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user password and delete reset token in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword }
      }),
      prisma.passwordResetToken.delete({
        where: { id: resetToken.id }
      })
    ])

    // Send confirmation email
    try {
      await sendPasswordResetConfirmationEmail(
        resetToken.user.email,
        resetToken.user.name || undefined
      )
    } catch (emailError) {
      // Log error but don't fail the request
      console.error('Failed to send confirmation email:', emailError)
    }

    return NextResponse.json({
      message: 'Ihr Passwort wurde erfolgreich zurückgesetzt. Sie können sich jetzt mit Ihrem neuen Passwort anmelden.'
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' },
      { status: 500 }
    )
  }
}

// GET endpoint to verify token validity
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token fehlt' },
        { status: 400 }
      )
    }

    // Hash the token to match stored version
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')

    // Find reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: hashedToken }
    })

    if (!resetToken) {
      return NextResponse.json({
        valid: false,
        error: 'Ungültiger Reset-Link'
      })
    }

    // Check if token has expired
    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json({
        valid: false,
        error: 'Der Reset-Link ist abgelaufen'
      })
    }

    return NextResponse.json({
      valid: true
    })
  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { valid: false, error: 'Fehler bei der Überprüfung' },
      { status: 500 }
    )
  }
}