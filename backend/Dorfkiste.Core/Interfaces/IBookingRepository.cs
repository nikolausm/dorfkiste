using Dorfkiste.Core.Entities;

namespace Dorfkiste.Core.Interfaces;

public interface IBookingRepository
{
    Task<IEnumerable<Booking>> GetAllAsync();
    Task<Booking?> GetByIdAsync(int id);
    Task<IEnumerable<Booking>> GetByOfferIdAsync(int offerId);
    Task<IEnumerable<Booking>> GetByCustomerIdAsync(int customerId);
    Task<IEnumerable<Booking>> GetByProviderIdAsync(int providerId);
    Task<IEnumerable<Booking>> GetOverlappingBookingsAsync(int offerId, DateOnly startDate, DateOnly endDate);
    Task<Booking> CreateAsync(Booking booking);
    Task<Booking> UpdateAsync(Booking booking);
    Task DeleteAsync(int id);
    Task<bool> HasOverlappingBookingsAsync(int offerId, DateOnly startDate, DateOnly endDate, int? excludeBookingId = null);
}