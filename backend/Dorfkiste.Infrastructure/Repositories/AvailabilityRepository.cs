using Microsoft.EntityFrameworkCore;
using Dorfkiste.Core.Entities;
using Dorfkiste.Core.Interfaces;
using Dorfkiste.Infrastructure.Data;

namespace Dorfkiste.Infrastructure.Repositories;

public class AvailabilityRepository : IAvailabilityRepository
{
    private readonly DorfkisteDbContext _context;

    public AvailabilityRepository(DorfkisteDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<AvailabilityOverride>> GetByOfferIdAsync(int offerId)
    {
        return await _context.AvailabilityOverrides
            .Where(a => a.OfferId == offerId)
            .OrderBy(a => a.Date)
            .ToListAsync();
    }

    public async Task<IEnumerable<AvailabilityOverride>> GetByOfferIdAndDateRangeAsync(int offerId, DateOnly startDate, DateOnly endDate)
    {
        return await _context.AvailabilityOverrides
            .Where(a => a.OfferId == offerId
                     && a.Date >= startDate
                     && a.Date <= endDate)
            .OrderBy(a => a.Date)
            .ToListAsync();
    }

    public async Task<AvailabilityOverride?> GetByOfferIdAndDateAsync(int offerId, DateOnly date)
    {
        return await _context.AvailabilityOverrides
            .FirstOrDefaultAsync(a => a.OfferId == offerId && a.Date == date);
    }

    public async Task<AvailabilityOverride> CreateAsync(AvailabilityOverride availabilityOverride)
    {
        availabilityOverride.CreatedAt = DateTime.UtcNow;
        _context.AvailabilityOverrides.Add(availabilityOverride);
        await _context.SaveChangesAsync();
        return availabilityOverride;
    }

    public async Task<AvailabilityOverride> UpdateAsync(AvailabilityOverride availabilityOverride)
    {
        _context.AvailabilityOverrides.Update(availabilityOverride);
        await _context.SaveChangesAsync();
        return availabilityOverride;
    }

    public async Task DeleteAsync(int id)
    {
        var availability = await _context.AvailabilityOverrides.FindAsync(id);
        if (availability != null)
        {
            _context.AvailabilityOverrides.Remove(availability);
            await _context.SaveChangesAsync();
        }
    }

    public async Task DeleteByOfferIdAndDateAsync(int offerId, DateOnly date)
    {
        var availability = await _context.AvailabilityOverrides
            .FirstOrDefaultAsync(a => a.OfferId == offerId && a.Date == date);

        if (availability != null)
        {
            _context.AvailabilityOverrides.Remove(availability);
            await _context.SaveChangesAsync();
        }
    }
}