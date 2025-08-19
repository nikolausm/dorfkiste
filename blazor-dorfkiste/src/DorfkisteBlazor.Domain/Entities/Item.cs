using DorfkisteBlazor.Domain.Common;

namespace DorfkisteBlazor.Domain.Entities;

/// <summary>
/// Item entity representing rentable items
/// </summary>
public class Item : BaseEntity, IAuditableEntity
{
    public required string Title { get; set; }
    public string? Description { get; set; }
    public required string Condition { get; set; } // neu, sehr gut, gut, gebraucht
    public decimal? PricePerDay { get; set; }
    public decimal? PricePerHour { get; set; }
    public decimal? Deposit { get; set; }
    public bool Available { get; set; } = true;
    public required string Location { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    // Delivery options
    public bool DeliveryAvailable { get; set; } = false;
    public decimal? DeliveryFee { get; set; }
    public double? DeliveryRadius { get; set; }
    public string? DeliveryDetails { get; set; }
    public bool PickupAvailable { get; set; } = true;

    // Foreign keys
    public Guid UserId { get; set; }
    public Guid CategoryId { get; set; }

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Category Category { get; set; } = null!;
    public virtual ICollection<Rental> Rentals { get; set; } = new List<Rental>();
    public virtual ICollection<ItemImage> Images { get; set; } = new List<ItemImage>();
    public virtual ICollection<WatchlistItem> WatchlistItems { get; set; } = new List<WatchlistItem>();
}