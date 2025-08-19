using DorfkisteBlazor.Domain.Common;

namespace DorfkisteBlazor.Domain.Entities;

/// <summary>
/// Payout entity for user earnings
/// </summary>
public class Payout : BaseEntity, IAuditableEntity
{
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "EUR";
    public required string Status { get; set; } // pending, processing, completed, failed
    public required string Method { get; set; } // stripe, paypal, bank_transfer
    public string? StripePayoutId { get; set; }
    public string? PaypalPayoutId { get; set; }
    public DateTime? ProcessedAt { get; set; }

    // Foreign key
    public Guid UserId { get; set; }

    // Navigation property
    public virtual User User { get; set; } = null!;
}