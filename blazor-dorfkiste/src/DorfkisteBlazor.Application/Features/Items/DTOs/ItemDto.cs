namespace DorfkisteBlazor.Application.Features.Items.DTOs;

/// <summary>
/// Data transfer object for item information
/// </summary>
public class ItemDto
{
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public required string Condition { get; set; }
    public decimal? PricePerDay { get; set; }
    public decimal? PricePerHour { get; set; }
    public decimal? Deposit { get; set; }
    public bool Available { get; set; }
    public required string Location { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public bool DeliveryAvailable { get; set; }
    public decimal? DeliveryFee { get; set; }
    public double? DeliveryRadius { get; set; }
    public bool PickupAvailable { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    public Guid UserId { get; set; }
    public string? UserName { get; set; }
    public string? UserAvatarUrl { get; set; }
    
    public Guid CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string? CategorySlug { get; set; }
    
    public IEnumerable<ItemImageDto> Images { get; set; } = new List<ItemImageDto>();
}

/// <summary>
/// Data transfer object for item image information
/// </summary>
public class ItemImageDto
{
    public Guid Id { get; set; }
    public required string Url { get; set; }
    public int Order { get; set; }
}