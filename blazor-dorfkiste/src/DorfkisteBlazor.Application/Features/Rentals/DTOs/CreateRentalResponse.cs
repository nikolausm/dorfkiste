namespace DorfkisteBlazor.Application.Features.Rentals.DTOs;

/// <summary>
/// Response object for rental creation
/// </summary>
public class CreateRentalResponse
{
    public Guid RentalId { get; set; }
    public decimal TotalPrice { get; set; }
    public decimal DepositRequired { get; set; }
    public decimal PlatformFee { get; set; }
    public decimal? DeliveryFee { get; set; }
    public string Status { get; set; } = "pending";
    public string PaymentStatus { get; set; } = "pending";
    public string? PaymentIntentId { get; set; }
    public string? PaypalOrderId { get; set; }
}