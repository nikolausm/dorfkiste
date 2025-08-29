namespace DorfkisteBlazor.Application.Features.Rentals.DTOs;

/// <summary>
/// Data transfer object for rental information
/// </summary>
public class RentalDto
{
    public Guid Id { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalPrice { get; set; }
    public decimal DepositPaid { get; set; }
    public decimal PlatformFee { get; set; }
    public string Status { get; set; } = "pending";
    public string PaymentStatus { get; set; } = "pending";
    public string? PaymentMethod { get; set; }
    public string? StripePaymentIntentId { get; set; }
    public string? PaypalOrderId { get; set; }

    // Delivery information
    public bool DeliveryRequested { get; set; }
    public string? DeliveryAddress { get; set; }
    public decimal? DeliveryFee { get; set; }

    // Foreign keys
    public Guid ItemId { get; set; }
    public Guid OwnerId { get; set; }
    public Guid RenterId { get; set; }

    // Related entity information
    public string ItemTitle { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public string RenterName { get; set; } = string.Empty;
    public string? ItemImageUrl { get; set; }

    // Audit fields
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}