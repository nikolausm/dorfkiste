using Dorfkiste.Core.Entities;

namespace Dorfkiste.Core.Interfaces;

public interface IBookingService
{
    Task<IEnumerable<Booking>> GetCustomerBookingsAsync(int customerId);
    Task<IEnumerable<Booking>> GetProviderBookingsAsync(int providerId);
    Task<Booking?> GetBookingByIdAsync(int bookingId);
    Task<AvailabilityResult> CheckAvailabilityAsync(int offerId, DateOnly startDate, DateOnly endDate);
    Task<BookingResult> CreateBookingAsync(int offerId, int customerId, DateOnly startDate, DateOnly endDate, bool termsAccepted, bool withdrawalRightAcknowledged);
    Task<IEnumerable<DateOnly>> GetBookedDatesAsync(int offerId);
    Task<decimal> CalculatePriceAsync(int offerId, DateOnly startDate, DateOnly endDate);
    Task BlockDatesAsync(int offerId, int providerId, DateOnly startDate, DateOnly endDate, string? reason);
    Task UnblockDatesAsync(int offerId, int providerId, DateOnly startDate, DateOnly endDate);
    Task<BookingResult> CancelBookingAsync(int bookingId, int providerId, string? reason);
    Task<IEnumerable<Booking>> GetRecentCompletedBookingsAsync(int count = 6);
}

public class AvailabilityResult
{
    public bool IsAvailable { get; set; }
    public List<DateOnly> AvailableDates { get; set; } = new();
    public List<DateOnly> UnavailableDates { get; set; } = new();
    public decimal PricePerDay { get; set; }
    public string? ErrorMessage { get; set; }
}

public class BookingResult
{
    public bool Success { get; set; }
    public Booking? Booking { get; set; }
    public string? ErrorMessage { get; set; }
}