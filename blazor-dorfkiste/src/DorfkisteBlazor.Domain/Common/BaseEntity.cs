using System.ComponentModel.DataAnnotations;

namespace DorfkisteBlazor.Domain.Common;

/// <summary>
/// Base entity class for all domain entities with common properties
/// Implements both auditable and soft deletable interfaces
/// </summary>
public abstract class BaseEntity : IEntity, IAuditableEntity, ISoftDeletable
{
    /// <summary>
    /// Unique identifier for the entity
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Date and time when the entity was created
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Date and time when the entity was last updated
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// User ID who created this entity
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// User ID who last updated this entity
    /// </summary>
    public string? UpdatedBy { get; set; }

    /// <summary>
    /// Indicates if the entity is active/enabled
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Indicates if the entity has been soft deleted
    /// </summary>
    public bool IsDeleted { get; set; } = false;

    /// <summary>
    /// Date and time when the entity was soft deleted
    /// </summary>
    public DateTime? DeletedAt { get; set; }

    /// <summary>
    /// User ID who deleted this entity
    /// </summary>
    public string? DeletedBy { get; set; }

    /// <summary>
    /// Timestamp for optimistic concurrency control
    /// </summary>
    [Timestamp]
    public byte[]? RowVersion { get; set; }

    protected BaseEntity()
    {
        Id = Guid.NewGuid();
        CreatedAt = DateTime.UtcNow;
        IsActive = true;
        IsDeleted = false;
    }
}