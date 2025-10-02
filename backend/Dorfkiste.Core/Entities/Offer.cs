namespace Dorfkiste.Core.Entities;

public class Offer
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal? PricePerDay { get; set; }
    public decimal? PricePerHour { get; set; }
    public bool IsService { get; set; }
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