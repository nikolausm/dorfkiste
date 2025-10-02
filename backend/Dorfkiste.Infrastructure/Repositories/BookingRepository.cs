using Microsoft.EntityFrameworkCore;
using Dorfkiste.Core.Entities;
using Dorfkiste.Core.Interfaces;
using Dorfkiste.Infrastructure.Data;

namespace Dorfkiste.Infrastructure.Repositories;

public class BookingRepository : IBookingRepository
{
    private readonly DorfkisteDbContext _context;

    public BookingRepository(DorfkisteDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Booking>> GetAllAsync()
    {
        return await _context.Bookings
            .Include(b => b.Offer)
                .ThenInclude(o => o.User)
            .Include(b => b.Customer)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<Booking?> GetByIdAsync(int id)
    {
        return await _context.Bookings
            .Include(b => b.Offer)
                .ThenInclude(o => o.User)
            .Include(b => b.Offer)
                .ThenInclude(o => o.Pictures)
            .Include(b => b.Customer)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<IEnumerable<Booking>> GetByOfferIdAsync(int offerId)
    {
        return await _context.Bookings
            .Include(b => b.Customer)
            .Where(b => b.OfferId == offerId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Booking>> GetByCustomerIdAsync(int customerId)
    {
        return await _context.Bookings
            .Include(b => b.Offer)
                .ThenInclude(o => o.User)
            .Include(b => b.Offer)
                .ThenInclude(o => o.Pictures)
            .Include(b => b.Customer)
            .Where(b => b.CustomerId == customerId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Booking>> GetByProviderIdAsync(int providerId)
    {
        return await _context.Bookings
            .Include(b => b.Offer)
                .ThenInclude(o => o.User)
            .Include(b => b.Offer)
                .ThenInclude(o => o.Pictures)
            .Include(b => b.Customer)
            .Where(b => b.Offer.UserId == providerId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Booking>> GetOverlappingBookingsAsync(int offerId, DateOnly startDate, DateOnly endDate)
    {
        return await _context.Bookings
            .Include(b => b.Customer)
            .Where(b => b.OfferId == offerId
                     && b.StartDate <= endDate
                     && b.EndDate >= startDate)
            .ToListAsync();
    }

    public async Task<bool> HasOverlappingBookingsAsync(int offerId, DateOnly startDate, DateOnly endDate, int? excludeBookingId = null)
    {
        var query = _context.Bookings
            .Where(b => b.OfferId == offerId
                     && b.StartDate <= endDate
                     && b.EndDate >= startDate);

        if (excludeBookingId.HasValue)
        {
            query = query.Where(b => b.Id != excludeBookingId.Value);
        }

        return await query.AnyAsync();
    }

    public async Task<Booking> CreateAsync(Booking booking)
    {
        booking.CreatedAt = DateTime.UtcNow;
        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();
        return booking;
    }

    public async Task<Booking> UpdateAsync(Booking booking)
    {
        _context.Bookings.Update(booking);
        await _context.SaveChangesAsync();
        return booking;
    }

    public async Task DeleteAsync(int id)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking != null)
        {
            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();
        }
    }
}