using DorfkisteBlazor.Domain.Common;

namespace DorfkisteBlazor.Domain.Entities;

/// <summary>
/// Password reset token entity for password recovery
/// </summary>
public class PasswordResetToken : BaseEntity, IAuditableEntity
{
    public required string Token { get; set; }
    public DateTime ExpiresAt { get; set; }

    // Foreign key
    public Guid UserId { get; set; }

    // Navigation property
    public virtual User User { get; set; } = null!;
}