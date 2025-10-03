using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Logging;
using Dorfkiste.Core.Interfaces;

namespace Dorfkiste.Application.Services;

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;
    private readonly string _smtpHost;
    private readonly int _smtpPort;
    private readonly string _smtpUsername;
    private readonly string _smtpPassword;
    private readonly string _fromEmail;
    private readonly string _fromName;
    private readonly string _baseUrl;

    public EmailService(
        ILogger<EmailService> logger,
        string smtpHost,
        int smtpPort,
        string smtpUsername,
        string smtpPassword,
        string fromEmail,
        string fromName,
        string baseUrl)
    {
        _logger = logger;
        _smtpHost = smtpHost;
        _smtpPort = smtpPort;
        _smtpUsername = smtpUsername;
        _smtpPassword = smtpPassword;
        _fromEmail = fromEmail;
        _fromName = fromName;
        _baseUrl = baseUrl;
    }

    public async Task SendVerificationEmailAsync(string toEmail, string firstName, string verificationToken)
    {
        var verificationUrl = $"{_baseUrl}/auth/verify-email?token={verificationToken}";
        var subject = "Bitte bestätigen Sie Ihre E-Mail-Adresse - Dorfkiste";
        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <h2>Willkommen bei Dorfkiste, {firstName}!</h2>
                <p>Vielen Dank für Ihre Registrierung. Bitte bestätigen Sie Ihre E-Mail-Adresse, um Ihr Konto zu aktivieren.</p>
                <p>
                    <a href='{verificationUrl}' style='background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;'>
                        E-Mail-Adresse bestätigen
                    </a>
                </p>
                <p>Oder kopieren Sie diesen Link in Ihren Browser:</p>
                <p>{verificationUrl}</p>
                <p>Dieser Link ist 24 Stunden gültig.</p>
                <hr>
                <p style='font-size: 12px; color: #666;'>
                    Falls Sie sich nicht bei Dorfkiste registriert haben, können Sie diese E-Mail ignorieren.
                </p>
            </body>
            </html>
        ";

        await SendEmailAsync(toEmail, subject, body);
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string firstName, string resetToken)
    {
        var resetUrl = $"{_baseUrl}/auth/reset-password?token={resetToken}";
        var subject = "Passwort zurücksetzen - Dorfkiste";
        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <h2>Passwort zurücksetzen</h2>
                <p>Hallo {firstName},</p>
                <p>Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt.</p>
                <p>
                    <a href='{resetUrl}' style='background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;'>
                        Passwort zurücksetzen
                    </a>
                </p>
                <p>Oder kopieren Sie diesen Link in Ihren Browser:</p>
                <p>{resetUrl}</p>
                <p>Dieser Link ist 1 Stunde gültig.</p>
                <hr>
                <p style='font-size: 12px; color: #666;'>
                    Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.
                </p>
            </body>
            </html>
        ";

        await SendEmailAsync(toEmail, subject, body);
    }

    public async Task SendAccountDeletionConfirmationAsync(string toEmail, string firstName)
    {
        var subject = "Ihr Konto wurde gelöscht - Dorfkiste";
        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <h2>Konto gelöscht</h2>
                <p>Hallo {firstName},</p>
                <p>Ihr Dorfkiste-Konto wurde erfolgreich gelöscht.</p>
                <p>Alle Ihre persönlichen Daten wurden gemäß der DSGVO anonymisiert oder gelöscht.</p>
                <p>Falls Sie Fragen haben, kontaktieren Sie uns bitte.</p>
                <hr>
                <p style='font-size: 12px; color: #666;'>
                    Vielen Dank, dass Sie Dorfkiste genutzt haben.
                </p>
            </body>
            </html>
        ";

        await SendEmailAsync(toEmail, subject, body);
    }

    public async Task SendWelcomeEmailAsync(string toEmail, string firstName)
    {
        var subject = "Willkommen bei Dorfkiste!";
        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <h2>Willkommen bei Dorfkiste, {firstName}!</h2>
                <p>Ihre E-Mail-Adresse wurde erfolgreich bestätigt.</p>
                <p>Sie können jetzt:</p>
                <ul>
                    <li>Angebote erstellen und veröffentlichen</li>
                    <li>Artikel und Dienstleistungen buchen</li>
                    <li>Mit anderen Nutzern kommunizieren</li>
                </ul>
                <p>
                    <a href='{_baseUrl}' style='background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;'>
                        Zur Dorfkiste
                    </a>
                </p>
            </body>
            </html>
        ";

        await SendEmailAsync(toEmail, subject, body);
    }

    private async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        try
        {
            using var message = new MailMessage();
            message.From = new MailAddress(_fromEmail, _fromName);
            message.To.Add(new MailAddress(toEmail));
            message.Subject = subject;
            message.Body = htmlBody;
            message.IsBodyHtml = true;

            using var smtpClient = new SmtpClient(_smtpHost, _smtpPort);
            smtpClient.Credentials = new NetworkCredential(_smtpUsername, _smtpPassword);
            smtpClient.EnableSsl = true;

            await smtpClient.SendMailAsync(message);

            _logger.LogInformation("Email sent successfully to {Email}", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
            throw;
        }
    }
}
