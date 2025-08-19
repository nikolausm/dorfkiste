namespace DorfkisteBlazor.Domain.Common;

/// <summary>
/// Minimal entity interface expected by some tests. Implemented by BaseEntity.
/// </summary>
public interface IEntity
{
    Guid Id { get; set; }
}
