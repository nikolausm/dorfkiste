namespace DorfkisteBlazor.Application.Features.Items.DTOs;

/// <summary>
/// Response object for item creation
/// </summary>
public class CreateItemResponse
{
    public Guid ItemId { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public required string Condition { get; set; }
    public decimal? PricePerDay { get; set; }
    public decimal? PricePerHour { get; set; }
    public decimal? Deposit { get; set; }
    public bool Available { get; set; } = true;
    public required string Location { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public bool DeliveryAvailable { get; set; }
    public decimal? DeliveryFee { get; set; }
    public double? DeliveryRadius { get; set; }
    public string? DeliveryDetails { get; set; }
    public bool PickupAvailable { get; set; }
    public Guid UserId { get; set; }
    public Guid CategoryId { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<string> ImageUrls { get; set; } = new();
}