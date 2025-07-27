import { Resend } from 'resend'
import { logger } from './logger'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailOptions {
  from?: string
  to: string | string[]
  subject: string
  html?: string
  text?: string
  replyTo?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

interface User {
  id: string
  name?: string | null
  email: string
}

interface Item {
  id: string
  name: string
  description?: string
  pricePerDay: number
  images?: { url: string }[]
}

interface Rental {
  id: string
  startDate: Date
  endDate: Date
  totalPrice: number
  item: Item
  renter: User
  owner: User
}

// Base email configuration
const EMAIL_CONFIG = {
  from: process.env.FROM_EMAIL || 'Dorfkiste <noreply@dorfkiste.de>',
  replyTo: process.env.REPLY_TO_EMAIL || 'support@dorfkiste.de',
  baseUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000'
}

// Common email styles
const EMAIL_STYLES = `
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: white;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .logo .d { color: #e53238; }
    .logo .o { color: #f9a316; }
    .logo .r { color: #5ba71b; }
    .logo .f { color: #3665f3; }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #3665f3;
      color: white;
      text-decoration: none;
      border-radius: 25px;
      font-weight: 600;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #1e49c7;
    }
    .button-secondary {
      background-color: #6c757d;
    }
    .button-success {
      background-color: #28a745;
    }
    .button-warning {
      background-color: #ffc107;
      color: #333;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
    .info-box {
      background-color: #e7f3ff;
      border: 1px solid #bee5eb;
      border-radius: 5px;
      padding: 15px;
      margin: 20px 0;
      color: #0c5460;
    }
    .success-box {
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 5px;
      padding: 15px;
      margin: 20px 0;
      color: #155724;
    }
    .warning-box {
      background-color: #fff3cd;
      border: 1px solid #ffeeba;
      border-radius: 5px;
      padding: 10px;
      margin: 20px 0;
      color: #856404;
    }
    .item-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      background-color: #f8f9fa;
    }
    .price {
      font-weight: bold;
      color: #28a745;
      font-size: 18px;
    }
    .rental-details {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      margin: 15px 0;
    }
  </style>
`

// Email template wrapper
function createEmailTemplate(content: string, title: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        ${EMAIL_STYLES}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <span class="d">D</span><span class="o">o</span><span class="r">r</span><span class="f">f</span><span>kiste</span>
            </div>
            <p style="color: #666; margin: 0;">Die Nachbarschafts-Verleihplattform</p>
          </div>
          
          ${content}
          
          <div class="footer">
            <p>Mit freundlichen Grüßen,<br>Ihr Dorfkiste-Team</p>
            <p style="font-size: 12px; color: #999;">
              Diese E-Mail wurde automatisch generiert. Bei Fragen antworten Sie einfach auf diese E-Mail.
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}

// Core email sending function
async function sendEmail(options: EmailOptions): Promise<any> {
  try {
    const emailData = {
      from: options.from || EMAIL_CONFIG.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo || EMAIL_CONFIG.replyTo,
      attachments: options.attachments
    }

    const { data, error } = await resend.emails.send(emailData)

    if (error) {
      logger.error('Failed to send email:', error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    logger.info('Email sent successfully', {
      to: options.to,
      subject: options.subject,
      messageId: data?.id
    })

    return data
  } catch (error) {
    logger.error('Email sending error:', error)
    throw error
  }
}

// 1. Welcome Email (User Registration)
export async function sendWelcomeEmail(user: User): Promise<any> {
  const loginUrl = `${EMAIL_CONFIG.baseUrl}/auth/signin`
  const profileUrl = `${EMAIL_CONFIG.baseUrl}/profile`
  
  const htmlContent = createEmailTemplate(`
    <h2>Willkommen bei Dorfkiste, ${user.name || 'lieber Nutzer'}! 🎉</h2>
    
    <p>Schön, dass Sie Teil unserer Nachbarschafts-Community werden! Mit Dorfkiste können Sie ganz einfach Gegenstände ausleihen und verleihen – ganz im Sinne der Nachbarschaftshilfe.</p>
    
    <div class="success-box">
      <h3 style="margin: 0;">✓ Ihr Konto wurde erfolgreich erstellt!</h3>
    </div>
    
    <h3>So geht's weiter:</h3>
    <ul>
      <li><strong>Profil vervollständigen:</strong> Fügen Sie ein Profilbild und weitere Informationen hinzu</li>
      <li><strong>Erste Gegenstände einstellen:</strong> Teilen Sie, was Sie verleihen möchten</li>
      <li><strong>In der Nachbarschaft stöbern:</strong> Entdecken Sie, was andere anbieten</li>
    </ul>
    
    <div style="text-align: center;">
      <a href="${profileUrl}" class="button">Profil vervollständigen</a>
      <a href="${EMAIL_CONFIG.baseUrl}" class="button button-secondary">Zur Plattform</a>
    </div>
    
    <div class="info-box">
      <h4>💡 Erste Schritte:</h4>
      <p>• Vervollständigen Sie Ihr Profil für mehr Vertrauen<br>
      • Stellen Sie 1-3 Gegenstände ein, die Sie gerne verleihen möchten<br>
      • Schauen Sie sich in Ihrer Nachbarschaft um</p>
    </div>
  `, 'Willkommen bei Dorfkiste')

  const textContent = `
Willkommen bei Dorfkiste, ${user.name || 'lieber Nutzer'}!

Schön, dass Sie Teil unserer Nachbarschafts-Community werden! Mit Dorfkiste können Sie ganz einfach Gegenstände ausleihen und verleihen.

Ihr Konto wurde erfolgreich erstellt!

So geht's weiter:
- Profil vervollständigen: ${profileUrl}
- Zur Plattform: ${EMAIL_CONFIG.baseUrl}

Erste Schritte:
• Vervollständigen Sie Ihr Profil für mehr Vertrauen
• Stellen Sie 1-3 Gegenstände ein, die Sie gerne verleihen möchten
• Schauen Sie sich in Ihrer Nachbarschaft um

Mit freundlichen Grüßen,
Ihr Dorfkiste-Team
  `.trim()

  return sendEmail({
    to: user.email,
    subject: '🎉 Willkommen bei Dorfkiste - Ihre Nachbarschafts-Community!',
    html: htmlContent,
    text: textContent
  })
}

// 2. Rental Confirmation Email (for Renter)
export async function sendRentalConfirmationEmail(rental: Rental): Promise<any> {
  const rentalUrl = `${EMAIL_CONFIG.baseUrl}/rentals/${rental.id}`
  const itemUrl = `${EMAIL_CONFIG.baseUrl}/items/${rental.item.id}`
  const startDate = rental.startDate.toLocaleDateString('de-DE')
  const endDate = rental.endDate.toLocaleDateString('de-DE')
  
  const htmlContent = createEmailTemplate(`
    <h2>Buchungsbestätigung - ${rental.item.name}</h2>
    
    <div class="success-box">
      <h3 style="margin: 0;">✓ Ihre Buchung wurde bestätigt!</h3>
    </div>
    
    <div class="rental-details">
      <h3>📋 Buchungsdetails:</h3>
      <p><strong>Gegenstand:</strong> ${rental.item.name}</p>
      <p><strong>Vermieter:</strong> ${rental.owner.name}</p>
      <p><strong>Mietdauer:</strong> ${startDate} bis ${endDate}</p>
      <p><strong>Gesamtpreis:</strong> <span class="price">${(rental.totalPrice / 100).toFixed(2)} €</span></p>
    </div>
    
    <div class="info-box">
      <h4>📍 Nächste Schritte:</h4>
      <p>• Kontaktieren Sie ${rental.owner.name} für die Übergabe<br>
      • Prüfen Sie den Gegenstand bei Übernahme sorgfältig<br>
      • Geben Sie den Artikel termingerecht und in gutem Zustand zurück</p>
    </div>
    
    <div style="text-align: center;">
      <a href="${rentalUrl}" class="button">Buchung anzeigen</a>
      <a href="${itemUrl}" class="button button-secondary">Artikel ansehen</a>
    </div>
  `, 'Buchungsbestätigung')

  const textContent = `
Buchungsbestätigung - ${rental.item.name}

Ihre Buchung wurde bestätigt!

Buchungsdetails:
- Gegenstand: ${rental.item.name}
- Vermieter: ${rental.owner.name}
- Mietdauer: ${startDate} bis ${endDate}
- Gesamtpreis: ${(rental.totalPrice / 100).toFixed(2)} €

Nächste Schritte:
• Kontaktieren Sie ${rental.owner.name} für die Übergabe
• Prüfen Sie den Gegenstand bei Übernahme sorgfältig
• Geben Sie den Artikel termingerecht und in gutem Zustand zurück

Buchung anzeigen: ${rentalUrl}

Mit freundlichen Grüßen,
Ihr Dorfkiste-Team
  `.trim()

  return sendEmail({
    to: rental.renter.email,
    subject: `✅ Buchungsbestätigung: ${rental.item.name}`,
    html: htmlContent,
    text: textContent
  })
}

// 3. New Rental Request Email (for Owner)
export async function sendNewRentalRequestEmail(rental: Rental): Promise<any> {
  const rentalUrl = `${EMAIL_CONFIG.baseUrl}/rentals/${rental.id}`
  const startDate = rental.startDate.toLocaleDateString('de-DE')
  const endDate = rental.endDate.toLocaleDateString('de-DE')
  
  const htmlContent = createEmailTemplate(`
    <h2>Neue Buchungsanfrage - ${rental.item.name}</h2>
    
    <p>Hallo ${rental.owner.name},</p>
    
    <p>Sie haben eine neue Buchungsanfrage für Ihren Artikel erhalten:</p>
    
    <div class="item-card">
      <h3>${rental.item.name}</h3>
      <p><strong>Interessent:</strong> ${rental.renter.name}</p>
      <p><strong>Mietdauer:</strong> ${startDate} bis ${endDate}</p>
      <p><strong>Gesamtpreis:</strong> <span class="price">${(rental.totalPrice / 100).toFixed(2)} €</span></p>
    </div>
    
    <div class="info-box">
      <h4>📞 Nächste Schritte:</h4>
      <p>• Bestätigen oder ablehnen Sie die Anfrage<br>
      • Kontaktieren Sie ${rental.renter.name} für Details<br>
      • Vereinbaren Sie einen Übergabetermin</p>
    </div>
    
    <div style="text-align: center;">
      <a href="${rentalUrl}" class="button">Anfrage bearbeiten</a>
    </div>
  `, 'Neue Buchungsanfrage')

  const textContent = `
Neue Buchungsanfrage - ${rental.item.name}

Hallo ${rental.owner.name},

Sie haben eine neue Buchungsanfrage für Ihren Artikel erhalten:

Artikel: ${rental.item.name}
Interessent: ${rental.renter.name}
Mietdauer: ${startDate} bis ${endDate}
Gesamtpreis: ${(rental.totalPrice / 100).toFixed(2)} €

Nächste Schritte:
• Bestätigen oder ablehnen Sie die Anfrage
• Kontaktieren Sie ${rental.renter.name} für Details
• Vereinbaren Sie einen Übergabetermin

Anfrage bearbeiten: ${rentalUrl}

Mit freundlichen Grüßen,
Ihr Dorfkiste-Team
  `.trim()

  return sendEmail({
    to: rental.owner.email,
    subject: `🔔 Neue Buchungsanfrage: ${rental.item.name}`,
    html: htmlContent,
    text: textContent
  })
}

// 4. Payment Receipt Email
export async function sendPaymentReceiptEmail(
  rental: Rental, 
  paymentId: string, 
  paymentMethod: string = 'Kreditkarte'
): Promise<any> {
  const receiptUrl = `${EMAIL_CONFIG.baseUrl}/rentals/${rental.id}/receipt`
  const startDate = rental.startDate.toLocaleDateString('de-DE')
  const endDate = rental.endDate.toLocaleDateString('de-DE')
  
  const htmlContent = createEmailTemplate(`
    <h2>Zahlungsbestätigung - ${rental.item.name}</h2>
    
    <div class="success-box">
      <h3 style="margin: 0;">✓ Zahlung erfolgreich verarbeitet!</h3>
    </div>
    
    <div class="rental-details">
      <h3>🧾 Rechnungsdetails:</h3>
      <p><strong>Rechnungsnummer:</strong> ${paymentId}</p>
      <p><strong>Gegenstand:</strong> ${rental.item.name}</p>
      <p><strong>Mietdauer:</strong> ${startDate} bis ${endDate}</p>
      <p><strong>Zahlungsmethode:</strong> ${paymentMethod}</p>
      <p><strong>Betrag:</strong> <span class="price">${(rental.totalPrice / 100).toFixed(2)} €</span></p>
      <p><strong>Datum:</strong> ${new Date().toLocaleDateString('de-DE')}</p>
    </div>
    
    <div class="info-box">
      <p><strong>📄 Rechnung:</strong> Eine detaillierte Rechnung finden Sie in Ihrem Konto unter "Meine Buchungen".</p>
    </div>
    
    <div style="text-align: center;">
      <a href="${receiptUrl}" class="button">Rechnung herunterladen</a>
    </div>
  `, 'Zahlungsbestätigung')

  const textContent = `
Zahlungsbestätigung - ${rental.item.name}

Zahlung erfolgreich verarbeitet!

Rechnungsdetails:
- Rechnungsnummer: ${paymentId}
- Gegenstand: ${rental.item.name}
- Mietdauer: ${startDate} bis ${endDate}
- Zahlungsmethode: ${paymentMethod}
- Betrag: ${(rental.totalPrice / 100).toFixed(2)} €
- Datum: ${new Date().toLocaleDateString('de-DE')}

Eine detaillierte Rechnung finden Sie in Ihrem Konto unter "Meine Buchungen".

Rechnung herunterladen: ${receiptUrl}

Mit freundlichen Grüßen,
Ihr Dorfkiste-Team
  `.trim()

  return sendEmail({
    to: rental.renter.email,
    subject: `💳 Zahlungsbestätigung: ${rental.item.name}`,
    html: htmlContent,
    text: textContent
  })
}

// 5. Rental Reminder Email (1 day before start)
export async function sendRentalReminderEmail(rental: Rental): Promise<any> {
  const rentalUrl = `${EMAIL_CONFIG.baseUrl}/rentals/${rental.id}`
  const startDate = rental.startDate.toLocaleDateString('de-DE')
  
  const htmlContent = createEmailTemplate(`
    <h2>Erinnerung: Ihre Miete startet morgen! 📅</h2>
    
    <p>Hallo ${rental.renter.name},</p>
    
    <p>Ihre Miete für <strong>${rental.item.name}</strong> startet morgen (${startDate}).</p>
    
    <div class="warning-box">
      <h4>⏰ Wichtige Erinnerung:</h4>
      <p>• Kontaktieren Sie ${rental.owner.name} für die Abholung<br>
      • Prüfen Sie die Verfügbarkeit und den Zustand<br>
      • Halten Sie sich an die vereinbarten Zeiten</p>
    </div>
    
    <div style="text-align: center;">
      <a href="${rentalUrl}" class="button">Buchung anzeigen</a>
    </div>
  `, 'Miet-Erinnerung')

  const textContent = `
Erinnerung: Ihre Miete startet morgen!

Hallo ${rental.renter.name},

Ihre Miete für ${rental.item.name} startet morgen (${startDate}).

Wichtige Erinnerung:
• Kontaktieren Sie ${rental.owner.name} für die Abholung
• Prüfen Sie die Verfügbarkeit und den Zustand
• Halten Sie sich an die vereinbarten Zeiten

Buchung anzeigen: ${rentalUrl}

Mit freundlichen Grüßen,
Ihr Dorfkiste-Team
  `.trim()

  return sendEmail({
    to: rental.renter.email,
    subject: `⏰ Erinnerung: Miete startet morgen - ${rental.item.name}`,
    html: htmlContent,
    text: textContent
  })
}

// 6. Review Request Email (after rental ends)
export async function sendReviewRequestEmail(rental: Rental): Promise<any> {
  const reviewUrl = `${EMAIL_CONFIG.baseUrl}/rentals/${rental.id}/review`
  
  const htmlContent = createEmailTemplate(`
    <h2>Wie war Ihre Erfahrung? ⭐</h2>
    
    <p>Hallo ${rental.renter.name},</p>
    
    <p>Ihre Miete von <strong>${rental.item.name}</strong> ist beendet. Wir hoffen, alles ist gut gelaufen!</p>
    
    <div class="info-box">
      <h4>💬 Teilen Sie Ihre Erfahrung:</h4>
      <p>Helfen Sie anderen Nutzern mit Ihrer ehrlichen Bewertung und stärken Sie das Vertrauen in unserer Community.</p>
    </div>
    
    <div style="text-align: center;">
      <a href="${reviewUrl}" class="button">Jetzt bewerten</a>
    </div>
    
    <p style="text-align: center; margin-top: 30px;">
      <strong>Vielen Dank für die Nutzung von Dorfkiste!</strong>
    </p>
  `, 'Bewertung abgeben')

  const textContent = `
Wie war Ihre Erfahrung?

Hallo ${rental.renter.name},

Ihre Miete von ${rental.item.name} ist beendet. Wir hoffen, alles ist gut gelaufen!

Teilen Sie Ihre Erfahrung:
Helfen Sie anderen Nutzern mit Ihrer ehrlichen Bewertung und stärken Sie das Vertrauen in unserer Community.

Jetzt bewerten: ${reviewUrl}

Vielen Dank für die Nutzung von Dorfkiste!

Mit freundlichen Grüßen,
Ihr Dorfkiste-Team
  `.trim()

  return sendEmail({
    to: rental.renter.email,
    subject: `⭐ Wie war Ihre Erfahrung mit ${rental.item.name}?`,
    html: htmlContent,
    text: textContent
  })
}

// 7. Password Reset Email (from existing email.ts, enhanced)
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
  userName?: string
): Promise<any> {
  const htmlContent = createEmailTemplate(`
    <h2>Passwort zurücksetzen</h2>
    
    <p>Hallo${userName ? ` ${userName}` : ''},</p>
    
    <p>Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts für Ihr Dorfkiste-Konto erhalten.</p>
    
    <div style="text-align: center;">
      <a href="${resetUrl}" class="button">Passwort zurücksetzen</a>
    </div>
    
    <div class="warning-box">
      <strong>Wichtig:</strong> Dieser Link ist nur 1 Stunde gültig. Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.
    </div>
    
    <p>Alternativ können Sie diesen Link kopieren und in Ihren Browser einfügen:</p>
    <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 14px;">
      ${resetUrl}
    </p>
  `, 'Passwort zurücksetzen')

  const textContent = `
Hallo${userName ? ` ${userName}` : ''},

Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts für Ihr Dorfkiste-Konto erhalten.

Öffnen Sie den folgenden Link, um Ihr Passwort zurückzusetzen:
${resetUrl}

Wichtig: Dieser Link ist nur 1 Stunde gültig. Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.

Mit freundlichen Grüßen,
Ihr Dorfkiste-Team
  `.trim()

  return sendEmail({
    to: email,
    subject: '🔐 Passwort zurücksetzen - Dorfkiste',
    html: htmlContent,
    text: textContent
  })
}

// 8. Admin Notification Email
export async function sendAdminNotificationEmail(
  type: 'new_user' | 'new_item' | 'rental_issue' | 'payment_failed' | 'report',
  data: any
): Promise<any> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@dorfkiste.de'
  
  let subject = ''
  let content = ''
  
  switch (type) {
    case 'new_user':
      subject = '👤 Neue Benutzerregistrierung'
      content = `
        <h2>Neue Benutzerregistrierung</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>E-Mail:</strong> ${data.email}</p>
        <p><strong>Registriert am:</strong> ${new Date().toLocaleString('de-DE')}</p>
      `
      break
    case 'new_item':
      subject = '📦 Neuer Artikel eingestellt'
      content = `
        <h2>Neuer Artikel eingestellt</h2>
        <p><strong>Artikel:</strong> ${data.name}</p>
        <p><strong>Von:</strong> ${data.ownerName}</p>
        <p><strong>Preis:</strong> ${(data.pricePerDay / 100).toFixed(2)} €/Tag</p>
      `
      break
    case 'rental_issue':
      subject = '⚠️ Problem bei Miete gemeldet'
      content = `
        <h2>Problem bei Miete gemeldet</h2>
        <p><strong>Miete:</strong> ${data.rentalId}</p>
        <p><strong>Problem:</strong> ${data.issue}</p>
        <p><strong>Gemeldet von:</strong> ${data.reportedBy}</p>
      `
      break
    case 'payment_failed':
      subject = '💳 Zahlung fehlgeschlagen'
      content = `
        <h2>Zahlung fehlgeschlagen</h2>
        <p><strong>Miete:</strong> ${data.rentalId}</p>
        <p><strong>Betrag:</strong> ${(data.amount / 100).toFixed(2)} €</p>
        <p><strong>Fehler:</strong> ${data.error}</p>
      `
      break
    case 'report':
      subject = '🚨 Neuer Report'
      content = `
        <h2>Neuer Report erhalten</h2>
        <p><strong>Typ:</strong> ${data.type}</p>
        <p><strong>Grund:</strong> ${data.reason}</p>
        <p><strong>Details:</strong> ${data.details}</p>
      `
      break
  }

  const htmlContent = createEmailTemplate(content, subject)

  return sendEmail({
    to: adminEmail,
    subject: `[Dorfkiste Admin] ${subject}`,
    html: htmlContent,
    text: content.replace(/<[^>]*>/g, '') // Strip HTML for text version
  })
}

// Export all email functions
export {
  sendEmail,
  sendWelcomeEmail,
  sendRentalConfirmationEmail,
  sendNewRentalRequestEmail,
  sendPaymentReceiptEmail,
  sendRentalReminderEmail,
  sendReviewRequestEmail,
  sendPasswordResetEmail,
  sendAdminNotificationEmail
}

// Export legacy function for compatibility
export { sendPasswordResetEmail as sendPasswordResetEmail_Legacy } from './email'
export { sendPasswordResetConfirmationEmail } from './email'