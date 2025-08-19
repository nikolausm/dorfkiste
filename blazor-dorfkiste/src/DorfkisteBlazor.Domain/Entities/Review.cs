using DorfkisteBlazor.Domain.Common;

namespace DorfkisteBlazor.Domain.Entities;

/// <summary>
/// Review entity for user reviews after rentals
/// </summary>
public class Review : BaseEntity, IAuditableEntity
{
    public int Rating { get; set; } // 1-5
    public string? Comment { get; set; }

    // Foreign keys
    public Guid RentalId { get; set; }
    public Guid ReviewerId { get; set; }
    public Guid ReviewedId { get; set; }

    // Backward/compatibility alias for tests expecting 'RevieweeId'
    public Guid RevieweeId
    {
        get => ReviewedId;
        set => ReviewedId = value;
    }

    // Navigation properties
    public virtual Rental Rental { get; set; } = null!;
    public virtual User Reviewer { get; set; } = null!;
    public virtual User Reviewed { get; set; } = null!;
}