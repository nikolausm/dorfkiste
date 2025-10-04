namespace Dorfkiste.Core.Entities;

public class UserPrivacySettings
{
    public int Id { get; set; }
    public int UserId { get; set; }

    // GDPR Consent Tracking
    public bool MarketingEmailsConsent { get; set; } = false;
    public bool DataProcessingConsent { get; set; } = true;
    public bool ProfileVisibilityConsent { get; set; } = true;
    public bool DataSharingConsent { get; set; } = false;

    // Consent Timestamps
    public DateTime? MarketingEmailsConsentDate { get; set; }
    public DateTime? DataProcessingConsentDate { get; set; }
    public DateTime? ProfileVisibilityConsentDate { get; set; }
    public DateTime? DataSharingConsentDate { get; set; }

    // Contact Information Visibility Settings
    public bool ShowPhoneNumber { get; set; } = true;
    public bool ShowMobileNumber { get; set; } = true;
    public bool ShowStreet { get; set; } = true;
    public bool ShowCity { get; set; } = true;

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public User User { get; set; } = null!;
}
