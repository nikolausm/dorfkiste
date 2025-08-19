using DorfkisteBlazor.Application.Common.Models;
using DorfkisteBlazor.Application.Features.Rentals.DTOs;

namespace DorfkisteBlazor.Application.Services;

/// <summary>
/// Service interface for rental management
/// </summary>
public interface IRentalService
{
    /// <summary>
    /// Create a new rental booking
    /// </summary>
    Task<Result<CreateRentalResponse>> CreateRentalAsync(CreateRentalDto dto);

    /// <summary>
    /// Get rental by ID with full details
    /// </summary>
    Task<Result<RentalDetailsDto>> GetRentalByIdAsync(Guid rentalId, Guid userId);

    /// <summary>
    /// Get user's rentals (as renter)
    /// </summary>
    Task<Result<RentalsListDto>> GetUserRentalsAsync(Guid userId, RentalFilterDto filter);

    /// <summary>
    /// Get user's bookings (as owner)
    /// </summary>
    Task<Result<RentalsListDto>> GetUserBookingsAsync(Guid userId, RentalFilterDto filter);

    /// <summary>
    /// Update rental status
    /// </summary>
    Task<Result<bool>> UpdateRentalStatusAsync(Guid rentalId, string status, Guid userId, string? reason = null);

    /// <summary>
    /// Confirm rental (owner accepts booking)
    /// </summary>
    Task<Result<bool>> ConfirmRentalAsync(Guid rentalId, Guid ownerId);

    /// <summary>
    /// Cancel rental
    /// </summary>
    Task<Result<CancelRentalDto>> CancelRentalAsync(Guid rentalId, Guid userId, string reason);

    /// <summary>
    /// Mark rental as completed
    /// </summary>
    Task<Result<bool>> CompleteRentalAsync(Guid rentalId, Guid userId);

    /// <summary>
    /// Extend rental period
    /// </summary>
    Task<Result<ExtendRentalDto>> ExtendRentalAsync(Guid rentalId, DateTime newEndDate, Guid userId);

    /// <summary>
    /// Calculate rental pricing
    /// </summary>
    Task<Result<RentalPricingDto>> CalculateRentalPricingAsync(Guid itemId, DateTime startDate, DateTime endDate, bool deliveryRequested = false);

    /// <summary>
    /// Check if user has access to rental
    /// </summary>
    Task<Result<bool>> UserHasAccessToRentalAsync(Guid rentalId, Guid userId);

    /// <summary>
    /// Get rental history for analytics
    /// </summary>
    Task<Result<RentalAnalyticsDto>> GetRentalAnalyticsAsync(Guid userId, DateTime? fromDate = null, DateTime? toDate = null);
}

public class CreateRentalDto
{
    public Guid ItemId { get; set; }
    public Guid RenterId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool DeliveryRequested { get; set; }
    public string? DeliveryAddress { get; set; }
    public string PaymentMethod { get; set; } = "stripe";
}

public class RentalDetailsDto
{
    public Guid Id { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalPrice { get; set; }
    public decimal DepositPaid { get; set; }
    public decimal PlatformFee { get; set; }
    public string Status { get; set; } = "";
    public string PaymentStatus { get; set; } = "";
    public string? PaymentMethod { get; set; }
    public bool DeliveryRequested { get; set; }
    public string? DeliveryAddress { get; set; }
    public decimal? DeliveryFee { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Related entities with full details
    public ItemDetailsDto Item { get; set; } = new();
    public UserSummaryDto Owner { get; set; } = new();
    public UserSummaryDto Renter { get; set; } = new();
    
    // Messages and reviews
    public List<MessageSummaryDto> Messages { get; set; } = new();
    public List<ReviewSummaryDto> Reviews { get; set; } = new();
    
    // Payment history
    public List<PaymentSummaryDto> Payments { get; set; } = new();
}

public class RentalsListDto
{
    public List<RentalSummaryDto> Rentals { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}

public class RentalFilterDto
{
    public string? Status { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? PaymentStatus { get; set; }
    public Guid? ItemId { get; set; }
    public string? SearchTerm { get; set; }
    public string SortBy { get; set; } = "CreatedAt";
    public string SortDirection { get; set; } = "desc";
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class CancelRentalDto
{
    public bool Success { get; set; }
    public decimal? RefundAmount { get; set; }
    public string? RefundMethod { get; set; }
    public DateTime? RefundProcessedAt { get; set; }
    public string? CancellationReason { get; set; }
}

public class ExtendRentalDto
{
    public bool Success { get; set; }
    public DateTime NewEndDate { get; set; }
    public decimal AdditionalCost { get; set; }
    public string? PaymentIntentId { get; set; }
}

public class RentalPricingDto
{
    public decimal BasePrice { get; set; }
    public decimal? DeliveryFee { get; set; }
    public decimal PlatformFee { get; set; }
    public decimal TotalPrice { get; set; }
    public decimal? DepositRequired { get; set; }
    public int RentalDays { get; set; }
    public decimal PricePerDay { get; set; }
    public decimal PlatformFeePercentage { get; set; }
}

public class RentalAnalyticsDto
{
    public int TotalRentals { get; set; }
    public int CompletedRentals { get; set; }
    public int CancelledRentals { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal AverageRentalValue { get; set; }
    public double AverageRentalDuration { get; set; }
    public int MostPopularItemId { get; set; }
    public string MostPopularItemTitle { get; set; } = "";
    public Dictionary<string, int> RentalsByStatus { get; set; } = new();
    public Dictionary<string, decimal> RevenueByMonth { get; set; } = new();
}

public class ItemDetailsDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public string Condition { get; set; } = "";
    public decimal? PricePerDay { get; set; }
    public decimal? PricePerHour { get; set; }
    public string Location { get; set; } = "";
    public bool DeliveryAvailable { get; set; }
    public decimal? DeliveryFee { get; set; }
    public List<string> ImageUrls { get; set; } = new();
    public string CategoryName { get; set; } = "";
}

public class UserSummaryDto
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string Email { get; set; } = "";
    public string? AvatarUrl { get; set; }
    public bool Verified { get; set; }
    public double AverageRating { get; set; }
    public int TotalReviews { get; set; }
}

public class MessageSummaryDto
{
    public Guid Id { get; set; }
    public string Content { get; set; } = "";
    public Guid SenderId { get; set; }
    public string SenderName { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public bool Read { get; set; }
}

public class ReviewSummaryDto
{
    public Guid Id { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public Guid ReviewerId { get; set; }
    public string ReviewerName { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}

public class PaymentSummaryDto
{
    public Guid Id { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } = "";
    public string Type { get; set; } = "";
    public string Method { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}

public class RentalSummaryDto
{
    public Guid Id { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalPrice { get; set; }
    public string Status { get; set; } = "";
    public string PaymentStatus { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    
    public string ItemTitle { get; set; } = "";
    public string? ItemImageUrl { get; set; }
    public string OwnerName { get; set; } = "";
    public string RenterName { get; set; } = "";
}