using Dorfkiste.Core.Entities;
using Dorfkiste.Core.Interfaces;

namespace Dorfkiste.Application.Services;

public class BookingService : IBookingService
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IAvailabilityRepository _availabilityRepository;
    private readonly IOfferRepository _offerRepository;
    private readonly IUserRepository _userRepository;
    private readonly IMessageService _messageService;

    public BookingService(
        IBookingRepository bookingRepository,
        IAvailabilityRepository availabilityRepository,
        IOfferRepository offerRepository,
        IUserRepository userRepository,
        IMessageService messageService)
    {
        _bookingRepository = bookingRepository;
        _availabilityRepository = availabilityRepository;
        _offerRepository = offerRepository;
        _userRepository = userRepository;
        _messageService = messageService;
    }

    public async Task<IEnumerable<Booking>> GetCustomerBookingsAsync(int customerId)
    {
        return await _bookingRepository.GetByCustomerIdAsync(customerId);
    }

    public async Task<IEnumerable<Booking>> GetProviderBookingsAsync(int providerId)
    {
        return await _bookingRepository.GetByProviderIdAsync(providerId);
    }

    public async Task<Booking?> GetBookingByIdAsync(int bookingId)
    {
        return await _bookingRepository.GetByIdAsync(bookingId);
    }

    public async Task<IEnumerable<DateOnly>> GetBookedDatesAsync(int offerId)
    {
        try
        {
            // Get all confirmed bookings for this offer
            var bookings = await _bookingRepository.GetByOfferIdAsync(offerId);
            var bookedDates = new List<DateOnly>();

            // Extract all individual dates from each booking's date range
            foreach (var booking in bookings.Where(b => b.Status == BookingStatus.Confirmed))
            {
                for (var date = booking.StartDate; date <= booking.EndDate; date = date.AddDays(1))
                {
                    bookedDates.Add(date);
                }
            }

            // Also get provider-blocked dates
            var blockedDates = await _availabilityRepository.GetByOfferIdAndDateRangeAsync(
                offerId,
                DateOnly.FromDateTime(DateTime.Today),
                DateOnly.FromDateTime(DateTime.Today.AddYears(1))
            );

            foreach (var override_ in blockedDates.Where(o => !o.IsAvailable))
            {
                bookedDates.Add(override_.Date);
            }

            return bookedDates.Distinct().OrderBy(d => d);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting booked dates for offer {offerId}: {ex.Message}");
            return Enumerable.Empty<DateOnly>();
        }
    }

    public async Task<AvailabilityResult> CheckAvailabilityAsync(int offerId, DateOnly startDate, DateOnly endDate)
    {
        try
        {
            var offer = await _offerRepository.GetByIdAsync(offerId);
            if (offer == null)
            {
                return new AvailabilityResult
                {
                    IsAvailable = false,
                    ErrorMessage = "Angebot wurde nicht gefunden."
                };
            }

            if (!offer.IsActive)
            {
                return new AvailabilityResult
                {
                    IsAvailable = false,
                    ErrorMessage = "Angebot ist nicht aktiv."
                };
            }

            // Validate date range
            var today = DateOnly.FromDateTime(DateTime.Today);
            if (startDate < today)
            {
                return new AvailabilityResult
                {
                    IsAvailable = false,
                    ErrorMessage = "Startdatum kann nicht in der Vergangenheit liegen."
                };
            }

            // Same-day bookings only allowed before 18:00
            if (startDate == today)
            {
                var now = DateTime.Now;
                if (now.Hour >= 18)
                {
                    return new AvailabilityResult
                    {
                        IsAvailable = false,
                        ErrorMessage = "Buchungen am gleichen Tag sind nur bis 18 Uhr möglich."
                    };
                }
            }

            if (endDate < startDate)
            {
                return new AvailabilityResult
                {
                    IsAvailable = false,
                    ErrorMessage = "Enddatum muss nach dem Startdatum liegen."
                };
            }

            var daysCount = endDate.DayNumber - startDate.DayNumber + 1;
            if (daysCount < 1 || daysCount > 14)
            {
                return new AvailabilityResult
                {
                    IsAvailable = false,
                    ErrorMessage = "Buchung muss zwischen 1 und 14 Tage sein."
                };
            }

            // Check for overlapping bookings
            var overlappingBookings = await _bookingRepository.GetOverlappingBookingsAsync(offerId, startDate, endDate);
            var bookedDates = new HashSet<DateOnly>();

            foreach (var booking in overlappingBookings)
            {
                for (var date = booking.StartDate; date <= booking.EndDate; date = date.AddDays(1))
                {
                    bookedDates.Add(date);
                }
            }

            // Check for availability overrides (provider blocked dates)
            var overrides = await _availabilityRepository.GetByOfferIdAndDateRangeAsync(offerId, startDate, endDate);
            var blockedDates = new HashSet<DateOnly>();

            foreach (var override_ in overrides.Where(o => !o.IsAvailable))
            {
                blockedDates.Add(override_.Date);
            }

            // Calculate available and unavailable dates
            var availableDates = new List<DateOnly>();
            var unavailableDates = new List<DateOnly>();

            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                if (bookedDates.Contains(date) || blockedDates.Contains(date))
                {
                    unavailableDates.Add(date);
                }
                else
                {
                    availableDates.Add(date);
                }
            }

            var pricePerDay = await CalculateDailyPriceAsync(offer);
            var isFullyAvailable = unavailableDates.Count == 0;

            return new AvailabilityResult
            {
                IsAvailable = isFullyAvailable,
                AvailableDates = availableDates,
                UnavailableDates = unavailableDates,
                PricePerDay = pricePerDay
            };
        }
        catch (Exception ex)
        {
            return new AvailabilityResult
            {
                IsAvailable = false,
                ErrorMessage = $"Fehler beim Prüfen der Verfügbarkeit: {ex.Message}"
            };
        }
    }

    public async Task<BookingResult> CreateBookingAsync(int offerId, int customerId, DateOnly startDate, DateOnly endDate, bool termsAccepted, bool withdrawalRightAcknowledged)
    {
        try
        {
            Console.WriteLine($"BookingService.CreateBookingAsync: offerId={offerId}, customerId={customerId}, startDate={startDate}, endDate={endDate}");

            // Validate legal compliance
            if (!termsAccepted)
            {
                return new BookingResult
                {
                    Success = false,
                    ErrorMessage = "Sie müssen die AGB akzeptieren, um eine Buchung vorzunehmen."
                };
            }

            if (!withdrawalRightAcknowledged)
            {
                return new BookingResult
                {
                    Success = false,
                    ErrorMessage = "Sie müssen die Widerrufsbelehrung zur Kenntnis nehmen."
                };
            }

            var offer = await _offerRepository.GetByIdAsync(offerId);
            if (offer == null)
            {
                Console.WriteLine($"Offer not found: offerId={offerId}");
                return new BookingResult
                {
                    Success = false,
                    ErrorMessage = "Angebot wurde nicht gefunden."
                };
            }

            Console.WriteLine($"Offer found: {offer.Title}, UserId={offer.UserId}");

            // Check if customer is trying to book their own offer
            if (offer.UserId == customerId)
            {
                Console.WriteLine($"Customer trying to book own offer: customerId={customerId}, offer.UserId={offer.UserId}");
                return new BookingResult
                {
                    Success = false,
                    ErrorMessage = "Sie können Ihr eigenes Angebot nicht buchen."
                };
            }

            // Check availability
            var availability = await CheckAvailabilityAsync(offerId, startDate, endDate);
            if (!availability.IsAvailable)
            {
                return new BookingResult
                {
                    Success = false,
                    ErrorMessage = availability.ErrorMessage ?? "Gewählter Zeitraum ist nicht verfügbar."
                };
            }

            // Calculate price and days
            var daysCount = endDate.DayNumber - startDate.DayNumber + 1;
            var totalPrice = await CalculatePriceAsync(offerId, startDate, endDate);

            // Create booking - auto-confirmed immediately
            Console.WriteLine($"Creating booking: totalPrice={totalPrice}, daysCount={daysCount}");
            var now = DateTime.UtcNow;
            var booking = new Booking
            {
                OfferId = offerId,
                CustomerId = customerId,
                StartDate = startDate,
                EndDate = endDate,
                TotalPrice = totalPrice,
                DaysCount = daysCount,
                Status = BookingStatus.Confirmed,
                CreatedAt = now,
                ConfirmedAt = now,
                TermsAccepted = termsAccepted,
                TermsAcceptedAt = termsAccepted ? now : null,
                WithdrawalRightAcknowledged = withdrawalRightAcknowledged,
                WithdrawalRightAcknowledgedAt = withdrawalRightAcknowledged ? now : null
            };

            Console.WriteLine($"Saving booking to repository...");
            var createdBooking = await _bookingRepository.CreateAsync(booking);
            Console.WriteLine($"Booking saved with ID: {createdBooking.Id}");

            // Send notification message to provider about confirmed booking
            Console.WriteLine($"Sending notification message...");
            await SendBookingNotificationAsync(createdBooking);
            Console.WriteLine($"Notification sent successfully");

            return new BookingResult
            {
                Success = true,
                Booking = createdBooking
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Exception in CreateBookingAsync: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return new BookingResult
            {
                Success = false,
                ErrorMessage = $"Fehler beim Erstellen der Buchung: {ex.Message}"
            };
        }
    }



    public async Task<decimal> CalculatePriceAsync(int offerId, DateOnly startDate, DateOnly endDate)
    {
        var offer = await _offerRepository.GetByIdAsync(offerId);
        if (offer == null)
            throw new InvalidOperationException("Angebot wurde nicht gefunden.");

        var daysCount = endDate.DayNumber - startDate.DayNumber + 1;
        var pricePerDay = await CalculateDailyPriceAsync(offer);

        return pricePerDay * daysCount;
    }

    public async Task BlockDatesAsync(int offerId, int providerId, DateOnly startDate, DateOnly endDate, string? reason)
    {
        var offer = await _offerRepository.GetByIdAsync(offerId);
        if (offer == null || offer.UserId != providerId)
            throw new UnauthorizedAccessException("Sie sind nicht berechtigt, Termine für dieses Angebot zu blockieren.");

        for (var date = startDate; date <= endDate; date = date.AddDays(1))
        {
            var existing = await _availabilityRepository.GetByOfferIdAndDateAsync(offerId, date);
            if (existing == null)
            {
                await _availabilityRepository.CreateAsync(new AvailabilityOverride
                {
                    OfferId = offerId,
                    Date = date,
                    IsAvailable = false,
                    Reason = reason
                });
            }
            else if (existing.IsAvailable)
            {
                existing.IsAvailable = false;
                existing.Reason = reason;
                await _availabilityRepository.UpdateAsync(existing);
            }
        }
    }

    public async Task UnblockDatesAsync(int offerId, int providerId, DateOnly startDate, DateOnly endDate)
    {
        var offer = await _offerRepository.GetByIdAsync(offerId);
        if (offer == null || offer.UserId != providerId)
            throw new UnauthorizedAccessException("Sie sind nicht berechtigt, Termine für dieses Angebot freizugeben.");

        for (var date = startDate; date <= endDate; date = date.AddDays(1))
        {
            await _availabilityRepository.DeleteByOfferIdAndDateAsync(offerId, date);
        }
    }

    private async Task<decimal> CalculateDailyPriceAsync(Offer offer)
    {
        if (offer.PricePerDay.HasValue)
        {
            return offer.PricePerDay.Value;
        }
        else if (offer.PricePerHour.HasValue)
        {
            // Convert hourly rate to daily rate (8 hours per day)
            return offer.PricePerHour.Value * 8;
        }
        else
        {
            throw new InvalidOperationException("Angebot hat keinen gültigen Preis.");
        }
    }

    public async Task<BookingResult> CancelBookingAsync(int bookingId, int providerId, string? reason)
    {
        try
        {
            var booking = await _bookingRepository.GetByIdAsync(bookingId);
            if (booking == null)
            {
                return new BookingResult
                {
                    Success = false,
                    ErrorMessage = "Buchung wurde nicht gefunden."
                };
            }

            var offer = await _offerRepository.GetByIdAsync(booking.OfferId);
            if (offer == null || offer.UserId != providerId)
            {
                return new BookingResult
                {
                    Success = false,
                    ErrorMessage = "Sie sind nicht berechtigt, diese Buchung zu stornieren."
                };
            }

            // Only allow cancelling confirmed bookings
            if (booking.Status != BookingStatus.Confirmed)
            {
                return new BookingResult
                {
                    Success = false,
                    ErrorMessage = "Diese Buchung kann nicht mehr storniert werden."
                };
            }

            // Update booking status to cancelled
            booking.Status = BookingStatus.Cancelled;
            await _bookingRepository.UpdateAsync(booking);

            // Send notification to customer
            await SendCancellationNotificationAsync(booking, reason);

            return new BookingResult
            {
                Success = true,
                Booking = booking
            };
        }
        catch (Exception ex)
        {
            return new BookingResult
            {
                Success = false,
                ErrorMessage = $"Fehler beim Stornieren der Buchung: {ex.Message}"
            };
        }
    }

    private async Task SendBookingNotificationAsync(Booking booking)
    {
        try
        {
            var offer = await _offerRepository.GetByIdAsync(booking.OfferId);
            var customer = await _userRepository.GetByIdAsync(booking.CustomerId);

            if (offer != null && customer != null)
            {
                var message = $"Neue Buchung für '{offer.Title}' bestätigt!\n\n" +
                             $"Zeitraum: {booking.StartDate:dd.MM.yyyy} bis {booking.EndDate:dd.MM.yyyy}\n" +
                             $"Dauer: {booking.DaysCount} Tag(e)\n" +
                             $"Gesamtpreis: {booking.TotalPrice:C}\n" +
                             $"Kunde: {customer.FirstName} {customer.LastName}\n\n" +
                             $"Die Buchung wurde automatisch bestätigt und der Zeitraum ist jetzt blockiert.";

                await _messageService.SendMessageAsync(
                    booking.CustomerId,
                    offer.UserId,
                    booking.OfferId,
                    message
                );
            }
        }
        catch (Exception ex)
        {
            // Log error but don't fail the booking process
            Console.WriteLine($"Fehler beim Senden der Buchungsbenachrichtigung: {ex.Message}");
        }
    }

    public async Task<IEnumerable<Booking>> GetRecentCompletedBookingsAsync(int count = 6)
    {
        return await _bookingRepository.GetRecentCompletedAsync(count);
    }

    private async Task SendCancellationNotificationAsync(Booking booking, string? reason)
    {
        try
        {
            var offer = await _offerRepository.GetByIdAsync(booking.OfferId);
            var provider = await _userRepository.GetByIdAsync(offer!.UserId);

            if (offer != null && provider != null)
            {
                var message = $"Buchung storniert: '{offer.Title}'\n\n" +
                             $"Zeitraum: {booking.StartDate:dd.MM.yyyy} bis {booking.EndDate:dd.MM.yyyy}\n" +
                             $"Dauer: {booking.DaysCount} Tag(e)\n" +
                             $"Gesamtpreis: {booking.TotalPrice:C}\n" +
                             $"Anbieter: {provider.FirstName} {provider.LastName}\n" +
                             $"Buchungs-ID: #{booking.Id}\n\n" +
                             $"Diese Buchung wurde vom Anbieter storniert. Der Zeitraum ist wieder verfügbar.";

                if (!string.IsNullOrWhiteSpace(reason))
                {
                    message += $"\n\nBegründung: {reason}";
                }

                await _messageService.SendMessageAsync(
                    offer.UserId,
                    booking.CustomerId,
                    booking.OfferId,
                    message
                );
            }
        }
        catch (Exception ex)
        {
            // Log error but don't fail the cancellation process
            Console.WriteLine($"Fehler beim Senden der Stornierungsbenachrichtigung: {ex.Message}");
        }
    }
}