using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Dorfkiste.Core.Interfaces;
using Dorfkiste.Core.Entities;

namespace Dorfkiste.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public BookingsController(IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    [HttpGet("test")]
    [AllowAnonymous]
    public IActionResult Test()
    {
        return Ok(new { message = "Booking API is working!", timestamp = DateTime.UtcNow });
    }

    [HttpGet("availability/{offerId}")]
    public async Task<ActionResult<AvailabilityResponseDto>> CheckAvailability(
        int offerId,
        [FromQuery] string startDate,
        [FromQuery] string endDate)
    {
        if (!DateOnly.TryParse(startDate, out var start) || !DateOnly.TryParse(endDate, out var end))
        {
            return BadRequest("Ungültiges Datumsformat. Verwenden Sie YYYY-MM-DD.");
        }

        var availability = await _bookingService.CheckAvailabilityAsync(offerId, start, end);

        return Ok(new AvailabilityResponseDto
        {
            IsAvailable = availability.IsAvailable,
            AvailableDates = availability.AvailableDates.Select(d => d.ToString("yyyy-MM-dd")).ToList(),
            UnavailableDates = availability.UnavailableDates.Select(d => d.ToString("yyyy-MM-dd")).ToList(),
            PricePerDay = availability.PricePerDay,
            ErrorMessage = availability.ErrorMessage
        });
    }

    [HttpGet("offers/{offerId}/booked-dates")]
    [AllowAnonymous]
    public async Task<ActionResult<BookedDatesResponseDto>> GetBookedDates(int offerId)
    {
        try
        {
            var bookedDates = await _bookingService.GetBookedDatesAsync(offerId);
            return Ok(new BookedDatesResponseDto
            {
                OfferId = offerId,
                BookedDates = bookedDates.Select(d => d.ToString("yyyy-MM-dd")).ToList()
            });
        }
        catch (Exception ex)
        {
            return BadRequest($"Fehler beim Abrufen der gebuchten Termine: {ex.Message}");
        }
    }

    [HttpPost("offers/{offerId}")]
    public async Task<ActionResult<BookingResponseDto>> CreateBooking(
        int offerId,
        [FromBody] CreateBookingRequest request)
    {
        try
        {
            Console.WriteLine($"CreateBooking called: offerId={offerId}, request={System.Text.Json.JsonSerializer.Serialize(request)}");

            if (!DateOnly.TryParse(request.StartDate, out var start) || !DateOnly.TryParse(request.EndDate, out var end))
            {
                Console.WriteLine("Date parsing failed");
                return BadRequest("Ungültiges Datumsformat. Verwenden Sie YYYY-MM-DD.");
            }

            var userId = GetCurrentUserId();
            Console.WriteLine($"Current user ID: {userId}");

            var result = await _bookingService.CreateBookingAsync(offerId, userId, start, end);
            Console.WriteLine($"Booking service result: Success={result.Success}, Error={result.ErrorMessage}");

            if (!result.Success)
            {
                return BadRequest(result.ErrorMessage);
            }

            var dto = MapToBookingResponseDto(result.Booking!);
            Console.WriteLine($"Booking created successfully: ID={result.Booking!.Id}");
            return Ok(dto);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Exception in CreateBooking: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("my-bookings")]
    public async Task<ActionResult<IEnumerable<BookingResponseDto>>> GetMyBookings()
    {
        var userId = GetCurrentUserId();
        var bookings = await _bookingService.GetCustomerBookingsAsync(userId);
        return Ok(bookings.Select(MapToBookingResponseDto));
    }

    [HttpGet("my-services")]
    public async Task<ActionResult<IEnumerable<BookingResponseDto>>> GetMyServiceBookings()
    {
        var userId = GetCurrentUserId();
        var bookings = await _bookingService.GetProviderBookingsAsync(userId);
        return Ok(bookings.Select(MapToBookingResponseDto));
    }

    [HttpGet("{bookingId}")]
    public async Task<ActionResult<BookingResponseDto>> GetBooking(int bookingId)
    {
        var booking = await _bookingService.GetBookingByIdAsync(bookingId);

        if (booking == null)
        {
            return NotFound("Buchung wurde nicht gefunden.");
        }

        var userId = GetCurrentUserId();

        // Check if user is either customer or provider
        if (booking.CustomerId != userId && booking.Offer.UserId != userId)
        {
            return Forbid("Sie haben keine Berechtigung, diese Buchung anzuzeigen.");
        }

        return Ok(MapToBookingResponseDto(booking));
    }



    [HttpGet("price/{offerId}")]
    public async Task<ActionResult<PriceCalculationDto>> CalculatePrice(
        int offerId,
        [FromQuery] string startDate,
        [FromQuery] string endDate)
    {
        if (!DateOnly.TryParse(startDate, out var start) || !DateOnly.TryParse(endDate, out var end))
        {
            return BadRequest("Ungültiges Datumsformat. Verwenden Sie YYYY-MM-DD.");
        }

        try
        {
            var totalPrice = await _bookingService.CalculatePriceAsync(offerId, start, end);
            var daysCount = end.DayNumber - start.DayNumber + 1;
            var pricePerDay = totalPrice / daysCount;

            return Ok(new PriceCalculationDto
            {
                TotalPrice = totalPrice,
                PricePerDay = pricePerDay,
                DaysCount = daysCount,
                StartDate = start.ToString("yyyy-MM-dd"),
                EndDate = end.ToString("yyyy-MM-dd")
            });
        }
        catch (Exception ex)
        {
            return BadRequest($"Fehler bei der Preisberechnung: {ex.Message}");
        }
    }

    [HttpPost("offers/{offerId}/block-dates")]
    public async Task<IActionResult> BlockDates(
        int offerId,
        [FromBody] BlockDatesRequest request)
    {
        if (!DateOnly.TryParse(request.StartDate, out var start) || !DateOnly.TryParse(request.EndDate, out var end))
        {
            return BadRequest("Ungültiges Datumsformat. Verwenden Sie YYYY-MM-DD.");
        }

        try
        {
            var userId = GetCurrentUserId();
            await _bookingService.BlockDatesAsync(offerId, userId, start, end, request.Reason);
            return Ok(new { message = "Termine erfolgreich blockiert." });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest($"Fehler beim Blockieren der Termine: {ex.Message}");
        }
    }

    [HttpDelete("offers/{offerId}/block-dates")]
    public async Task<IActionResult> UnblockDates(
        int offerId,
        [FromQuery] string startDate,
        [FromQuery] string endDate)
    {
        if (!DateOnly.TryParse(startDate, out var start) || !DateOnly.TryParse(endDate, out var end))
        {
            return BadRequest("Ungültiges Datumsformat. Verwenden Sie YYYY-MM-DD.");
        }

        try
        {
            var userId = GetCurrentUserId();
            await _bookingService.UnblockDatesAsync(offerId, userId, start, end);
            return Ok(new { message = "Blockierung erfolgreich aufgehoben." });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest($"Fehler beim Aufheben der Blockierung: {ex.Message}");
        }
    }

    [HttpPost("{bookingId}/cancel")]
    public async Task<ActionResult<BookingResponseDto>> CancelBooking(
        int bookingId,
        [FromBody] CancelBookingRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _bookingService.CancelBookingAsync(bookingId, userId, request.Reason);

            if (!result.Success)
            {
                return BadRequest(result.ErrorMessage);
            }

            return Ok(MapToBookingResponseDto(result.Booking!));
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Fehler beim Stornieren der Buchung: {ex.Message}");
        }
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim!);
    }

    private static BookingResponseDto MapToBookingResponseDto(Booking booking)
    {
        return new BookingResponseDto
        {
            Id = booking.Id,
            StartDate = booking.StartDate.ToString("yyyy-MM-dd"),
            EndDate = booking.EndDate.ToString("yyyy-MM-dd"),
            TotalPrice = booking.TotalPrice,
            DaysCount = booking.DaysCount,
            Status = booking.Status.ToString(),
            CreatedAt = booking.CreatedAt,
            ConfirmedAt = booking.ConfirmedAt,
            Offer = new BookingOfferDto
            {
                Id = booking.Offer.Id,
                Title = booking.Offer.Title,
                Description = booking.Offer.Description,
                IsService = booking.Offer.IsService,
                PricePerDay = booking.Offer.PricePerDay,
                PricePerHour = booking.Offer.PricePerHour,
                IsActive = booking.Offer.IsActive,
                Provider = new BookingUserDto
                {
                    Id = booking.Offer.User.Id,
                    FirstName = booking.Offer.User.FirstName,
                    LastName = booking.Offer.User.LastName,
                    Email = booking.Offer.User.Email
                },
                FirstPicture = booking.Offer.Pictures?.OrderBy(p => p.DisplayOrder).FirstOrDefault() is var firstPicture && firstPicture != null
                    ? new BookingPictureDto
                    {
                        Id = firstPicture.Id,
                        FileName = firstPicture.FileName,
                        ContentType = firstPicture.ContentType,
                        DisplayOrder = firstPicture.DisplayOrder
                    }
                    : null
            },
            Customer = new BookingUserDto
            {
                Id = booking.Customer.Id,
                FirstName = booking.Customer.FirstName,
                LastName = booking.Customer.LastName,
                Email = booking.Customer.Email
            }
        };
    }
}

// DTOs
public class CreateBookingRequest
{
    public string StartDate { get; set; } = string.Empty;
    public string EndDate { get; set; } = string.Empty;
}


public class BlockDatesRequest
{
    public string StartDate { get; set; } = string.Empty;
    public string EndDate { get; set; } = string.Empty;
    public string? Reason { get; set; }
}

public class AvailabilityResponseDto
{
    public bool IsAvailable { get; set; }
    public List<string> AvailableDates { get; set; } = new();
    public List<string> UnavailableDates { get; set; } = new();
    public decimal PricePerDay { get; set; }
    public string? ErrorMessage { get; set; }
}

public class BookedDatesResponseDto
{
    public int OfferId { get; set; }
    public List<string> BookedDates { get; set; } = new();
}

public class BookingResponseDto
{
    public int Id { get; set; }
    public string StartDate { get; set; } = string.Empty;
    public string EndDate { get; set; } = string.Empty;
    public decimal TotalPrice { get; set; }
    public int DaysCount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    public BookingOfferDto Offer { get; set; } = null!;
    public BookingUserDto Customer { get; set; } = null!;
}

public class BookingOfferDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsService { get; set; }
    public decimal? PricePerDay { get; set; }
    public decimal? PricePerHour { get; set; }
    public bool IsActive { get; set; }
    public BookingUserDto Provider { get; set; } = null!;
    public BookingPictureDto? FirstPicture { get; set; }
}

public class BookingPictureDto
{
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
}

public class BookingUserDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class PriceCalculationDto
{
    public decimal TotalPrice { get; set; }
    public decimal PricePerDay { get; set; }
    public int DaysCount { get; set; }
    public string StartDate { get; set; } = string.Empty;
    public string EndDate { get; set; } = string.Empty;
}

public class CancelBookingRequest
{
    public string? Reason { get; set; }
}