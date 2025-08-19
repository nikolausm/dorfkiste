using DorfkisteBlazor.Application.Common.Models;
using DorfkisteBlazor.Application.Features.Items.DTOs;
using DorfkisteBlazor.Domain.Entities;

namespace DorfkisteBlazor.Application.Services;

/// <summary>
/// Service interface for user management
/// </summary>
public interface IUserService
{
    /// <summary>
    /// Get user by ID with related data
    /// </summary>
    Task<Result<UserProfileDto>> GetUserProfileAsync(Guid userId);

    /// <summary>
    /// Update user profile
    /// </summary>
    Task<Result<UserProfileDto>> UpdateUserProfileAsync(Guid userId, UpdateUserProfileDto dto);

    /// <summary>
    /// Get user's rental statistics
    /// </summary>
    Task<Result<UserStatsDto>> GetUserStatsAsync(Guid userId);

    /// <summary>
    /// Verify user email
    /// </summary>
    Task<Result<bool>> VerifyUserEmailAsync(Guid userId, string verificationToken);

    /// <summary>
    /// Create password reset token
    /// </summary>
    Task<Result<string>> CreatePasswordResetTokenAsync(string email);

    /// <summary>
    /// Reset password using token
    /// </summary>
    Task<Result<bool>> ResetPasswordAsync(string token, string newPassword);

    /// <summary>
    /// Get user's reviews and ratings
    /// </summary>
    Task<Result<UserReviewsDto>> GetUserReviewsAsync(Guid userId, int page = 1, int pageSize = 20);

    /// <summary>
    /// Block/unblock a user (admin only)
    /// </summary>
    Task<Result<bool>> SetUserBlockStatusAsync(Guid userId, bool blocked, string? reason = null);
}

public class UserProfileDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = "";
    public string? Name { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public bool Verified { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Statistics
    public int TotalItems { get; set; }
    public int ActiveRentals { get; set; }
    public int CompletedRentals { get; set; }
    public double AverageRating { get; set; }
    public int TotalReviews { get; set; }
    
    // Recent activity
    public List<ItemDto> RecentItems { get; set; } = new();
    public List<ReviewDto> RecentReviews { get; set; } = new();
}

public class UpdateUserProfileDto
{
    public string? Name { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public string? PaypalEmail { get; set; }
}

public class UserStatsDto
{
    public int TotalItemsListed { get; set; }
    public int TotalRentalsAsOwner { get; set; }
    public int TotalRentalsAsRenter { get; set; }
    public decimal TotalEarnings { get; set; }
    public decimal TotalSpent { get; set; }
    public double AverageRatingAsOwner { get; set; }
    public double AverageRatingAsRenter { get; set; }
    public int TotalReviewsReceived { get; set; }
    public int TotalReviewsGiven { get; set; }
    public DateTime MemberSince { get; set; }
}

public class UserReviewsDto
{
    public List<ReviewDto> ReviewsReceived { get; set; } = new();
    public List<ReviewDto> ReviewsGiven { get; set; } = new();
    public double AverageRatingReceived { get; set; }
    public double AverageRatingGiven { get; set; }
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}

public class ReviewDto
{
    public Guid Id { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
    
    public Guid ReviewerId { get; set; }
    public string? ReviewerName { get; set; }
    public string? ReviewerAvatarUrl { get; set; }
    
    public Guid ReviewedId { get; set; }
    public string? ReviewedName { get; set; }
    
    public Guid RentalId { get; set; }
    public string? ItemTitle { get; set; }
}