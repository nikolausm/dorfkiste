namespace Dorfkiste.Core.Entities;

public class Offer
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal? PricePerDay { get; set; }
    public decimal? PricePerHour { get; set; }
    public decimal? SalePrice { get; set; }  // For selling items
    public bool IsService { get; set; }
    public bool IsForSale { get; set; }  // True for selling, false for renting
    public bool DeliveryAvailable { get; set; }  // Delivery option
    public decimal? DeliveryCost { get; set; }  // Shipping cost
    public decimal? Deposit { get; set; }  // Deposit for expensive items
    public string? ImagePath { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    
    public ICollection<OfferPicture> Pictures { get; set; } = new List<OfferPicture>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<AvailabilityOverride> AvailabilityOverrides { get; set; } = new List<AvailabilityOverride>();
}