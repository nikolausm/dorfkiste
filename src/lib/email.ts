import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
  userName?: string
) {
  const { data, error } = await resend.emails.send({
    from: 'Dorfkiste <noreply@your-domain.com>',
    to: email,
    subject: 'Passwort zurücksetzen - Dorfkiste',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Passwort zurücksetzen</title>
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
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              text-align: center;
              font-size: 14px;
              color: #666;
            }
            .warning {
              background-color: #fff3cd;
              border: 1px solid #ffeeba;
              border-radius: 5px;
              padding: 10px;
              margin: 20px 0;
              color: #856404;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <span class="d">D</span><span class="o">o</span><span class="r">r</span><span class="f">f</span><span>kiste</span>
              </div>
              <p style="color: #666; margin: 0;">Die Nachbarschafts-Verleihplattform</p>
            </div>
            
            <h2>Hallo${userName ? ` ${userName}` : ''},</h2>
            
            <p>Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts für Ihr Dorfkiste-Konto erhalten.</p>
            
            <p>Klicken Sie auf den folgenden Button, um Ihr Passwort zurückzusetzen:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Passwort zurücksetzen</a>
            </div>
            
            <div class="warning">
              <strong>Wichtig:</strong> Dieser Link ist nur 1 Stunde gültig. Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.
            </div>
            
            <p>Alternativ können Sie diesen Link kopieren und in Ihren Browser einfügen:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 14px;">
              ${resetUrl}
            </p>
            
            <div class="footer">
              <p>Mit freundlichen Grüßen,<br>Ihr Dorfkiste-Team</p>
              <p style="font-size: 12px; color: #999;">
                Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht darauf.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Hallo${userName ? ` ${userName}` : ''},

Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts für Ihr Dorfkiste-Konto erhalten.

Öffnen Sie den folgenden Link, um Ihr Passwort zurückzusetzen:
${resetUrl}

Wichtig: Dieser Link ist nur 1 Stunde gültig. Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.

Mit freundlichen Grüßen,
Ihr Dorfkiste-Team
    `.trim()
  })

  if (error) {
    console.error('Failed to send password reset email:', error)
    throw new Error('Failed to send email')
  }

  return data
}

export async function sendPasswordResetConfirmationEmail(
  email: string,
  userName?: string
) {
  const { data, error } = await resend.emails.send({
    from: 'Dorfkiste <noreply@your-domain.com>',
    to: email,
    subject: 'Ihr Passwort wurde zurückgesetzt - Dorfkiste',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Passwort erfolgreich zurückgesetzt</title>
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
            .success {
              background-color: #d4edda;
              border: 1px solid #c3e6cb;
              border-radius: 5px;
              padding: 15px;
              margin: 20px 0;
              color: #155724;
              text-align: center;
            }
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
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              text-align: center;
              font-size: 14px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <span class="d">D</span><span class="o">o</span><span class="r">r</span><span class="f">f</span><span>kiste</span>
              </div>
              <p style="color: #666; margin: 0;">Die Nachbarschafts-Verleihplattform</p>
            </div>
            
            <h2>Hallo${userName ? ` ${userName}` : ''},</h2>
            
            <div class="success">
              <h3 style="margin: 0;">✓ Ihr Passwort wurde erfolgreich zurückgesetzt!</h3>
            </div>
            
            <p>Sie können sich jetzt mit Ihrem neuen Passwort bei Dorfkiste anmelden.</p>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXTAUTH_URL}/auth/signin" class="button">Jetzt anmelden</a>
            </div>
            
            <p style="margin-top: 30px;"><strong>Sicherheitstipps:</strong></p>
            <ul style="color: #666;">
              <li>Verwenden Sie ein starkes, einzigartiges Passwort</li>
              <li>Teilen Sie Ihr Passwort niemals mit anderen</li>
              <li>Ändern Sie Ihr Passwort regelmäßig</li>
            </ul>
            
            <div class="footer">
              <p>Mit freundlichen Grüßen,<br>Ihr Dorfkiste-Team</p>
              <p style="font-size: 12px; color: #999;">
                Falls Sie diese Änderung nicht vorgenommen haben, kontaktieren Sie bitte umgehend unseren Support.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Hallo${userName ? ` ${userName}` : ''},

Ihr Passwort wurde erfolgreich zurückgesetzt!

Sie können sich jetzt mit Ihrem neuen Passwort bei Dorfkiste anmelden:
${process.env.NEXTAUTH_URL}/auth/signin

Sicherheitstipps:
- Verwenden Sie ein starkes, einzigartiges Passwort
- Teilen Sie Ihr Passwort niemals mit anderen
- Ändern Sie Ihr Passwort regelmäßig

Falls Sie diese Änderung nicht vorgenommen haben, kontaktieren Sie bitte umgehend unseren Support.

Mit freundlichen Grüßen,
Ihr Dorfkiste-Team
    `.trim()
  })

  if (error) {
    console.error('Failed to send password reset confirmation email:', error)
    throw new Error('Failed to send email')
  }

  return data
}