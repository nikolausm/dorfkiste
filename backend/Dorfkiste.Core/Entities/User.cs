namespace Dorfkiste.Core.Entities;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsAdmin { get; set; } = false;

    // GDPR: Email Verification (Double-Opt-In)
    public bool EmailVerified { get; set; } = false;
    public string? VerificationToken { get; set; }
    public DateTime? VerificationTokenExpiry { get; set; }

    // GDPR: Account Deletion
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
    public string? DeletionReason { get; set; }

    public ContactInfo ContactInfo { get; set; } = new();
    public UserPrivacySettings PrivacySettings { get; set; } = new();
    public ICollection<Offer> Offers { get; set; } = new List<Offer>();
    public ICollection<Booking> CustomerBookings { get; set; } = new List<Booking>();
}