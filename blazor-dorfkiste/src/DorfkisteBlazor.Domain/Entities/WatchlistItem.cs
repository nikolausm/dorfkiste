using DorfkisteBlazor.Domain.Common;

namespace DorfkisteBlazor.Domain.Entities;

/// <summary>
/// Watchlist item entity for user favorites
/// </summary>
public class WatchlistItem : BaseEntity, IAuditableEntity
{
    // Foreign keys
    public Guid UserId { get; set; }
    public Guid ItemId { get; set; }

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Item Item { get; set; } = null!;
}