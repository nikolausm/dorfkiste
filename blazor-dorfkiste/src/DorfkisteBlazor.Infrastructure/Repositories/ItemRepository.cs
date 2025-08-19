using Microsoft.EntityFrameworkCore;
using DorfkisteBlazor.Domain.Entities;
using DorfkisteBlazor.Domain.Interfaces;
using DorfkisteBlazor.Infrastructure.Data;
using System.Linq.Expressions;

namespace DorfkisteBlazor.Infrastructure.Repositories;

/// <summary>
/// Specialized repository for Item entities with complex queries
/// </summary>
public interface IItemRepository : IRepository<Item>
{
    Task<(IEnumerable<Item> Items, int TotalCount)> SearchItemsAsync(
        string? searchTerm = null,
        Guid? categoryId = null,
        string? location = null,
        decimal? minPrice = null,
        decimal? maxPrice = null,
        bool? availableOnly = null,
        double? latitude = null,
        double? longitude = null,
        double? radiusKm = null,
        int pageNumber = 1,
        int pageSize = 20,
        string orderBy = "CreatedAt",
        bool ascending = false,
        CancellationToken cancellationToken = default);

    Task<IEnumerable<Item>> GetItemsByUserAsync(Guid userId, bool includeInactive = false, CancellationToken cancellationToken = default);

    Task<IEnumerable<Item>> GetItemsByCategoryAsync(Guid categoryId, int count = 10, CancellationToken cancellationToken = default);

    Task<IEnumerable<Item>> GetFeaturedItemsAsync(int count = 10, CancellationToken cancellationToken = default);

    Task<IEnumerable<Item>> GetRecentItemsAsync(int count = 10, CancellationToken cancellationToken = default);

    Task<IEnumerable<Item>> GetItemsNearLocationAsync(double latitude, double longitude, double radiusKm, int count = 20, CancellationToken cancellationToken = default);

    Task<bool> IsItemAvailableForPeriodAsync(Guid itemId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    Task<IEnumerable<Item>> GetSimilarItemsAsync(Guid itemId, int count = 5, CancellationToken cancellationToken = default);

    Task<Dictionary<string, int>> GetItemStatisticsByLocationAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Implementation of specialized Item repository
/// </summary>
public class ItemRepository : Repository<Item>, IItemRepository
{
    public ItemRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<(IEnumerable<Item> Items, int TotalCount)> SearchItemsAsync(
        string? searchTerm = null,
        Guid? categoryId = null,
        string? location = null,
        decimal? minPrice = null,
        decimal? maxPrice = null,
        bool? availableOnly = null,
        double? latitude = null,
        double? longitude = null,
        double? radiusKm = null,
        int pageNumber = 1,
        int pageSize = 20,
        string orderBy = "CreatedAt",
        bool ascending = false,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .Include(i => i.Category)
            .Include(i => i.User)
            .Include(i => i.Images.OrderBy(img => img.Order))
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(i => 
                EF.Functions.Contains(i.Title, searchTerm) ||
                EF.Functions.Contains(i.Description ?? "", searchTerm) ||
                EF.Functions.Contains(i.Category.Name, searchTerm));
        }

        if (categoryId.HasValue)
        {
            query = query.Where(i => i.CategoryId == categoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(location))
        {
            query = query.Where(i => EF.Functions.Contains(i.Location, location));
        }

        if (minPrice.HasValue)
        {
            query = query.Where(i => i.PricePerDay >= minPrice.Value || i.PricePerHour >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(i => i.PricePerDay <= maxPrice.Value || i.PricePerHour <= maxPrice.Value);
        }

        if (availableOnly == true)
        {
            query = query.Where(i => i.Available);
        }

        // Geographic filtering
        if (latitude.HasValue && longitude.HasValue && radiusKm.HasValue)
        {
            // Using approximate distance calculation (for more accuracy, consider using PostGIS or similar)
            query = query.Where(i => 
                i.Latitude.HasValue && 
                i.Longitude.HasValue &&
                Math.Abs(i.Latitude.Value - latitude.Value) <= radiusKm.Value / 111.0 && // Rough conversion
                Math.Abs(i.Longitude.Value - longitude.Value) <= radiusKm.Value / (111.0 * Math.Cos(latitude.Value * Math.PI / 180.0)));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        // Apply ordering
        query = orderBy.ToLower() switch
        {
            "title" => ascending ? query.OrderBy(i => i.Title) : query.OrderByDescending(i => i.Title),
            "price" => ascending ? query.OrderBy(i => i.PricePerDay ?? i.PricePerHour ?? 0) : query.OrderByDescending(i => i.PricePerDay ?? i.PricePerHour ?? 0),
            "location" => ascending ? query.OrderBy(i => i.Location) : query.OrderByDescending(i => i.Location),
            "category" => ascending ? query.OrderBy(i => i.Category.Name) : query.OrderByDescending(i => i.Category.Name),
            _ => ascending ? query.OrderBy(i => i.CreatedAt) : query.OrderByDescending(i => i.CreatedAt)
        };

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<IEnumerable<Item>> GetItemsByUserAsync(Guid userId, bool includeInactive = false, CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .Include(i => i.Category)
            .Include(i => i.Images.OrderBy(img => img.Order))
            .Where(i => i.UserId == userId);

        if (!includeInactive)
        {
            query = query.Where(i => i.IsActive);
        }

        return await query
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Item>> GetItemsByCategoryAsync(Guid categoryId, int count = 10, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(i => i.Category)
            .Include(i => i.User)
            .Include(i => i.Images.OrderBy(img => img.Order))
            .Where(i => i.CategoryId == categoryId && i.Available && i.IsActive)
            .OrderByDescending(i => i.CreatedAt)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Item>> GetFeaturedItemsAsync(int count = 10, CancellationToken cancellationToken = default)
    {
        // For now, return recent items with good ratings or high engagement
        // In the future, this could be based on a "featured" flag or algorithm
        return await _dbSet
            .Include(i => i.Category)
            .Include(i => i.User)
            .Include(i => i.Images.OrderBy(img => img.Order))
            .Where(i => i.Available && i.IsActive && i.Images.Any())
            .OrderByDescending(i => i.CreatedAt)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Item>> GetRecentItemsAsync(int count = 10, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(i => i.Category)
            .Include(i => i.User)
            .Include(i => i.Images.OrderBy(img => img.Order))
            .Where(i => i.Available && i.IsActive)
            .OrderByDescending(i => i.CreatedAt)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Item>> GetItemsNearLocationAsync(double latitude, double longitude, double radiusKm, int count = 20, CancellationToken cancellationToken = default)
    {
        // Approximate distance calculation - for production use, consider PostGIS or similar
        return await _dbSet
            .Include(i => i.Category)
            .Include(i => i.User)
            .Include(i => i.Images.OrderBy(img => img.Order))
            .Where(i => 
                i.Available && 
                i.IsActive &&
                i.Latitude.HasValue && 
                i.Longitude.HasValue &&
                Math.Abs(i.Latitude.Value - latitude) <= radiusKm / 111.0 &&
                Math.Abs(i.Longitude.Value - longitude) <= radiusKm / (111.0 * Math.Cos(latitude * Math.PI / 180.0)))
            .OrderByDescending(i => i.CreatedAt)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> IsItemAvailableForPeriodAsync(Guid itemId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        var item = await _dbSet
            .Include(i => i.Rentals)
            .FirstOrDefaultAsync(i => i.Id == itemId, cancellationToken);

        if (item == null || !item.Available || !item.IsActive)
        {
            return false;
        }

        // Check for overlapping rentals
        var hasOverlappingRentals = await _context.Rentals
            .AnyAsync(r => 
                r.ItemId == itemId &&
                r.Status != "cancelled" &&
                r.Status != "completed" &&
                ((r.StartDate <= startDate && r.EndDate > startDate) ||
                 (r.StartDate < endDate && r.EndDate >= endDate) ||
                 (r.StartDate >= startDate && r.EndDate <= endDate)),
                cancellationToken);

        return !hasOverlappingRentals;
    }

    public async Task<IEnumerable<Item>> GetSimilarItemsAsync(Guid itemId, int count = 5, CancellationToken cancellationToken = default)
    {
        var item = await _dbSet
            .Include(i => i.Category)
            .FirstOrDefaultAsync(i => i.Id == itemId, cancellationToken);

        if (item == null)
        {
            return Enumerable.Empty<Item>();
        }

        return await _dbSet
            .Include(i => i.Category)
            .Include(i => i.User)
            .Include(i => i.Images.OrderBy(img => img.Order))
            .Where(i => 
                i.Id != itemId &&
                i.CategoryId == item.CategoryId &&
                i.Available &&
                i.IsActive)
            .OrderByDescending(i => i.CreatedAt)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    public async Task<Dictionary<string, int>> GetItemStatisticsByLocationAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(i => i.IsActive)
            .GroupBy(i => i.Location)
            .Select(g => new { Location = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .Take(10)
            .ToDictionaryAsync(x => x.Location, x => x.Count, cancellationToken);
    }
}