namespace Dorfkiste.Core.Interfaces;

public interface IEmailService
{
    Task SendVerificationEmailAsync(string toEmail, string firstName, string verificationToken);
    Task SendPasswordResetEmailAsync(string toEmail, string firstName, string resetToken);
    Task SendAccountDeletionConfirmationAsync(string toEmail, string firstName);
    Task SendWelcomeEmailAsync(string toEmail, string firstName);
}
