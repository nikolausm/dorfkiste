using DorfkisteBlazor.Domain.Common;

namespace DorfkisteBlazor.Domain.Entities;

/// <summary>
/// Message entity for rental-related communication
/// </summary>
public class Message : BaseEntity, IAuditableEntity
{
    public required string Content { get; set; }
    public bool Read { get; set; } = false;

    // Foreign keys
    public Guid SenderId { get; set; }
    public Guid RentalId { get; set; }

    // Navigation properties
    public virtual User Sender { get; set; } = null!;
    public virtual Rental Rental { get; set; } = null!;
}