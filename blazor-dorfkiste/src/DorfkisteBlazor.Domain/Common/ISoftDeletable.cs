namespace DorfkisteBlazor.Domain.Common;

/// <summary>
/// Interface for entities that support soft deletion
/// </summary>
public interface ISoftDeletable
{
    bool IsDeleted { get; set; }
    DateTime? DeletedAt { get; set; }
    string? DeletedBy { get; set; }
}