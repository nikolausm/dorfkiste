namespace DorfkisteBlazor.Domain.Interfaces;

/// <summary>
/// Unit of Work pattern interface for managing database transactions
/// </summary>
public interface IUnitOfWork : IDisposable
{
    /// <summary>
    /// Commit all changes to the database
    /// </summary>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Begin a new database transaction
    /// </summary>
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Commit the current transaction
    /// </summary>
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Rollback the current transaction
    /// </summary>
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if there are unsaved changes
    /// </summary>
    bool HasChanges();

    /// <summary>
    /// Get repository for a specific entity type
    /// </summary>
    IRepository<T> Repository<T>() where T : Common.BaseEntity;
}