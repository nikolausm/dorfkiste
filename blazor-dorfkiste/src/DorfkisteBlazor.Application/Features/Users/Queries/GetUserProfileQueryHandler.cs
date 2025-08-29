using DorfkisteBlazor.Application.Common.Interfaces;
using DorfkisteBlazor.Application.Common.Models;
using DorfkisteBlazor.Application.Features.Users.DTOs;
using DorfkisteBlazor.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DorfkisteBlazor.Application.Features.Users.Queries;

/// <summary>
/// Handler for GetUserProfileQuery
/// </summary>
public class GetUserProfileQueryHandler : IQueryHandler<GetUserProfileQuery, Result<UserProfileDto?>>
{
    private readonly IRepository<Domain.Entities.User> _userRepository;
    private readonly ILogger<GetUserProfileQueryHandler> _logger;

    public GetUserProfileQueryHandler(
        IRepository<Domain.Entities.User> userRepository,
        ILogger<GetUserProfileQueryHandler> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<Result<UserProfileDto?>> Handle(GetUserProfileQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _userRepository.GetByIdAsync(request.UserId);
            
            if (user == null)
            {
                return Result.Success<UserProfileDto?>(null);
            }

            // Calculate statistics
            var totalItems = user.Items.Count;
            var activeRentals = user.RentalsAsOwner.Count(r => r.Status == "active") + 
                              user.RentalsAsRenter.Count(r => r.Status == "active");
            var completedRentals = user.RentalsAsOwner.Count(r => r.Status == "completed") + 
                                  user.RentalsAsRenter.Count(r => r.Status == "completed");
            var reviewsReceived = user.ReviewsReceived.ToList();
            var averageRating = reviewsReceived.Any() ? reviewsReceived.Average(r => r.Rating) : 0.0;

            var profileDto = new UserProfileDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                AvatarUrl = user.AvatarUrl,
                Bio = user.Bio,
                Verified = user.Verified,
                PaypalEmail = user.PaypalEmail,
                TotalItems = totalItems,
                ActiveRentals = activeRentals,
                CompletedRentals = completedRentals,
                AverageRating = averageRating,
                TotalReviews = reviewsReceived.Count,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };

            return Result.Success<UserProfileDto?>(profileDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting user profile for user {UserId}", request.UserId);
            return Result.Failure<UserProfileDto?>("An error occurred while retrieving the user profile");
        }
    }
}