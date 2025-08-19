using DorfkisteBlazor.Domain.Common;

namespace DorfkisteBlazor.Domain.Entities;

/// <summary>
/// Payment entity for tracking all payments
/// </summary>
public class Payment : BaseEntity, IAuditableEntity
{
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "EUR";
    public required string Status { get; set; } // pending, succeeded, failed, refunded
    public required string Type { get; set; } // rental_payment, deposit, platform_fee
    public required string Method { get; set; } // stripe, paypal
    public string? StripePaymentIntentId { get; set; }
    public string? PaypalPaymentId { get; set; }
    public string? Metadata { get; set; } // JSON string for additional data

    // Compatibility alias for tests expecting 'PaypalOrderId'
    public string? PaypalOrderId
    {
        get => PaypalPaymentId;
        set => PaypalPaymentId = value;
    }

    // Compatibility alias for tests expecting 'PaymentMethod'
    public string PaymentMethod
    {
        get => Method;
        set => Method = value;
    }

    // Foreign keys
    public Guid UserId { get; set; }
    public Guid? RentalId { get; set; }

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Rental? Rental { get; set; }
}