namespace Dorfkiste.Core.Entities;

public class AvailabilityOverride
{
    public int Id { get; set; }
    public DateOnly Date { get; set; }
    public bool IsAvailable { get; set; } // false = blocked by provider
    public string? Reason { get; set; }
    public DateTime CreatedAt { get; set; }

    // Foreign Key
    public int OfferId { get; set; }
    public Offer Offer { get; set; } = null!;
}