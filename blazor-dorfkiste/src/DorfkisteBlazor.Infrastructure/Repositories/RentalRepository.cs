using Microsoft.EntityFrameworkCore;
using DorfkisteBlazor.Domain.Entities;
using DorfkisteBlazor.Domain.Interfaces;
using DorfkisteBlazor.Infrastructure.Data;

namespace DorfkisteBlazor.Infrastructure.Repositories;

/// <summary>
/// Specialized repository for Rental entities with complex queries
/// </summary>
public interface IRentalRepository : IRepository<Rental>
{
    Task<IEnumerable<Rental>> GetRentalsByUserAsync(Guid userId, bool asOwner, CancellationToken cancellationToken = default);
    
    Task<IEnumerable<Rental>> GetActiveRentalsAsync(CancellationToken cancellationToken = default);
    
    Task<IEnumerable<Rental>> GetRentalsByItemAsync(Guid itemId, CancellationToken cancellationToken = default);
    
    Task<IEnumerable<Rental>> GetRentalsForPeriodAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    
    Task<decimal> GetTotalRevenueByUserAsync(Guid userId, DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default);
    
    Task<IEnumerable<Rental>> GetOverdueRentalsAsync(CancellationToken cancellationToken = default);
    
    Task<Dictionary<string, int>> GetRentalStatisticsAsync(CancellationToken cancellationToken = default);
    
    Task<IEnumerable<DateTime>> GetBlockedDatesForItemAsync(Guid itemId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    
    Task<(decimal TotalRevenue, int TotalRentals, decimal AverageRentalValue)> GetRevenueStatsAsync(
        DateTime? startDate = null, 
        DateTime? endDate = null, 
        Guid? userId = null, 
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Implementation of specialized Rental repository
/// </summary>
public class RentalRepository : Repository<Rental>, IRentalRepository
{
    public RentalRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Rental>> GetRentalsByUserAsync(Guid userId, bool asOwner, CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .Include(r => r.Item)
                .ThenInclude(i => i.Images.OrderBy(img => img.Order))
            .Include(r => r.Item.Category)
            .Include(r => r.Owner)
            .Include(r => r.Renter)
            .Where(r => asOwner ? r.OwnerId == userId : r.RenterId == userId);

        return await query
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Rental>> GetActiveRentalsAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        
        return await _dbSet
            .Include(r => r.Item)
            .Include(r => r.Owner)
            .Include(r => r.Renter)
            .Where(r => 
                r.Status == "active" &&
                r.StartDate <= now &&
                r.EndDate >= now)
            .OrderBy(r => r.EndDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Rental>> GetRentalsByItemAsync(Guid itemId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(r => r.Owner)
            .Include(r => r.Renter)
            .Where(r => r.ItemId == itemId)
            .OrderByDescending(r => r.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Rental>> GetRentalsForPeriodAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(r => r.Item)
            .Include(r => r.Owner)
            .Include(r => r.Renter)
            .Where(r => 
                r.StartDate <= endDate &&
                r.EndDate >= startDate)
            .OrderBy(r => r.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<decimal> GetTotalRevenueByUserAsync(Guid userId, DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .Where(r => 
                r.OwnerId == userId &&
                r.PaymentStatus == "paid" &&
                r.Status != "cancelled");

        if (startDate.HasValue)
        {
            query = query.Where(r => r.CreatedAt >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(r => r.CreatedAt <= endDate.Value);
        }

        return await query.SumAsync(r => r.TotalPrice - r.PlatformFee, cancellationToken);
    }

    public async Task<IEnumerable<Rental>> GetOverdueRentalsAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        
        return await _dbSet
            .Include(r => r.Item)
            .Include(r => r.Owner)
            .Include(r => r.Renter)
            .Where(r => 
                r.Status == "active" &&
                r.EndDate < now)
            .OrderBy(r => r.EndDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<Dictionary<string, int>> GetRentalStatisticsAsync(CancellationToken cancellationToken = default)
    {
        var stats = await _dbSet
            .GroupBy(r => r.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Status, x => x.Count, cancellationToken);

        // Add additional statistics
        stats["Total"] = await _dbSet.CountAsync(cancellationToken);
        stats["ThisMonth"] = await _dbSet.CountAsync(r => r.CreatedAt >= DateTime.UtcNow.AddMonths(-1), cancellationToken);
        stats["LastMonth"] = await _dbSet.CountAsync(r => 
            r.CreatedAt >= DateTime.UtcNow.AddMonths(-2) && 
            r.CreatedAt < DateTime.UtcNow.AddMonths(-1), cancellationToken);

        return stats;
    }

    public async Task<IEnumerable<DateTime>> GetBlockedDatesForItemAsync(Guid itemId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        var rentals = await _dbSet
            .Where(r => 
                r.ItemId == itemId &&
                r.Status != "cancelled" &&
                r.Status != "completed" &&
                r.StartDate <= endDate &&
                r.EndDate >= startDate)
            .Select(r => new { r.StartDate, r.EndDate })
            .ToListAsync(cancellationToken);

        var blockedDates = new List<DateTime>();
        
        foreach (var rental in rentals)
        {
            var currentDate = rental.StartDate.Date;
            while (currentDate <= rental.EndDate.Date)
            {
                if (currentDate >= startDate.Date && currentDate <= endDate.Date)
                {
                    blockedDates.Add(currentDate);
                }
                currentDate = currentDate.AddDays(1);
            }
        }

        return blockedDates.Distinct().OrderBy(d => d);
    }

    public async Task<(decimal TotalRevenue, int TotalRentals, decimal AverageRentalValue)> GetRevenueStatsAsync(
        DateTime? startDate = null, 
        DateTime? endDate = null, 
        Guid? userId = null, 
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet.Where(r => 
            r.PaymentStatus == "paid" && 
            r.Status != "cancelled");

        if (startDate.HasValue)
        {
            query = query.Where(r => r.CreatedAt >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(r => r.CreatedAt <= endDate.Value);
        }

        if (userId.HasValue)
        {
            query = query.Where(r => r.OwnerId == userId.Value);
        }

        var totalRevenue = await query.SumAsync(r => r.TotalPrice, cancellationToken);
        var totalRentals = await query.CountAsync(cancellationToken);
        var averageRentalValue = totalRentals > 0 ? totalRevenue / totalRentals : 0;

        return (totalRevenue, totalRentals, averageRentalValue);
    }
}

/// <summary>
/// Repository for user-related operations
/// </summary>
public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    
    Task<IEnumerable<User>> GetTopRentersAsync(int count = 10, CancellationToken cancellationToken = default);
    
    Task<IEnumerable<User>> GetTopOwnersAsync(int count = 10, CancellationToken cancellationToken = default);
    
    Task<Dictionary<string, object>> GetUserStatisticsAsync(Guid userId, CancellationToken cancellationToken = default);
}

/// <summary>
/// Implementation of specialized User repository
/// </summary>
public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public async Task<IEnumerable<User>> GetTopRentersAsync(int count = 10, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(u => u.RentalsAsRenter)
            .Where(u => u.RentalsAsRenter.Any())
            .OrderByDescending(u => u.RentalsAsRenter.Count())
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<User>> GetTopOwnersAsync(int count = 10, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(u => u.Items)
            .Where(u => u.Items.Any())
            .OrderByDescending(u => u.Items.Count())
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    public async Task<Dictionary<string, object>> GetUserStatisticsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _dbSet
            .Include(u => u.Items)
            .Include(u => u.RentalsAsOwner)
            .Include(u => u.RentalsAsRenter)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user == null)
        {
            return new Dictionary<string, object>();
        }

        var totalRevenue = user.RentalsAsOwner
            .Where(r => r.PaymentStatus == "paid" && r.Status != "cancelled")
            .Sum(r => r.TotalPrice - r.PlatformFee);

        var stats = new Dictionary<string, object>
        {
            ["TotalItems"] = user.Items.Count(i => i.IsActive),
            ["TotalRentalsAsOwner"] = user.RentalsAsOwner.Count(),
            ["TotalRentalsAsRenter"] = user.RentalsAsRenter.Count(),
            ["TotalRevenue"] = totalRevenue,
            ["AverageRentalValue"] = user.RentalsAsOwner.Any() 
                ? user.RentalsAsOwner.Average(r => r.TotalPrice) 
                : 0,
            ["MemberSince"] = user.CreatedAt,
            ["IsVerified"] = user.Verified,
            ["ActiveItems"] = user.Items.Count(i => i.Available && i.IsActive)
        };

        return stats;
    }
}