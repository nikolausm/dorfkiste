using DorfkisteBlazor.Domain.Common;

namespace DorfkisteBlazor.Domain.Entities;

/// <summary>
/// Rental entity representing rental bookings
/// </summary>
public class Rental : BaseEntity, IAuditableEntity
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalPrice { get; set; }
    public decimal DepositPaid { get; set; }
    public decimal PlatformFee { get; set; } = 0;
    public string Status { get; set; } = "pending"; // pending, confirmed, active, completed, cancelled
    public string PaymentStatus { get; set; } = "pending"; // pending, paid, refunded
    public string? PaymentMethod { get; set; } // stripe, paypal
    public string? StripePaymentIntentId { get; set; }
    public string? PaypalOrderId { get; set; }

    // Delivery information
    public bool DeliveryRequested { get; set; } = false;
    public string? DeliveryAddress { get; set; }
    public decimal? DeliveryFee { get; set; }

    // Foreign keys
    public Guid ItemId { get; set; }
    public Guid OwnerId { get; set; }
    public Guid RenterId { get; set; }

    // Navigation properties
    public virtual Item Item { get; set; } = null!;
    public virtual User Owner { get; set; } = null!;
    public virtual User Renter { get; set; } = null!;
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
}