using DorfkisteBlazor.Domain.Common;

namespace DorfkisteBlazor.Domain.Entities;

/// <summary>
/// Item image entity for storing item photos
/// </summary>
public class ItemImage : BaseEntity, IAuditableEntity
{
    public required string Url { get; set; }
    public int Order { get; set; } = 0;

    // Foreign key
    public Guid ItemId { get; set; }

    // Navigation property
    public virtual Item Item { get; set; } = null!;
}