using DorfkisteBlazor.Domain.Common;

namespace DorfkisteBlazor.Domain.Entities;

/// <summary>
/// Platform settings entity for configuration
/// </summary>
public class PlatformSettings : BaseEntity, IAuditableEntity
{
    public decimal PlatformFeePercentage { get; set; } = 10; // Platform fee as percentage
    public string? StripeSecretKey { get; set; }
    public string? StripePublishableKey { get; set; }
    public string? StripeWebhookSecret { get; set; }
    public string? PaypalClientId { get; set; }
    public string? PaypalClientSecret { get; set; }
    public string PaypalMode { get; set; } = "sandbox"; // sandbox or live
}