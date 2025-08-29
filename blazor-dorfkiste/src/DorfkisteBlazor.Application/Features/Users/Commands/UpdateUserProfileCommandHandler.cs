using DorfkisteBlazor.Application.Common.Interfaces;
using DorfkisteBlazor.Application.Common.Models;
using DorfkisteBlazor.Application.Features.Users.DTOs;
using DorfkisteBlazor.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace DorfkisteBlazor.Application.Features.Users.Commands;

/// <summary>
/// Handler for UpdateUserProfileCommand
/// </summary>
public class UpdateUserProfileCommandHandler : ICommandHandler<UpdateUserProfileCommand, Result<UserProfileDto>>
{
    private readonly IRepository<Domain.Entities.User> _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateUserProfileCommandHandler> _logger;

    public UpdateUserProfileCommandHandler(
        IRepository<Domain.Entities.User> userRepository,
        IUnitOfWork unitOfWork,
        ILogger<UpdateUserProfileCommandHandler> logger)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<UserProfileDto>> Handle(UpdateUserProfileCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _userRepository.GetByIdAsync(request.UserId);
            if (user == null)
            {
                return Result.Failure<UserProfileDto>("User not found");
            }

            // Update user properties
            if (request.Name != null)
                user.Name = request.Name;
            
            if (request.Bio != null)
                user.Bio = request.Bio;
            
            if (request.AvatarUrl != null)
                user.AvatarUrl = request.AvatarUrl;
            
            if (request.PaypalEmail != null)
                user.PaypalEmail = request.PaypalEmail;

            await _userRepository.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();

            // Calculate statistics for response
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

            _logger.LogInformation("Updated profile for user {UserId}", request.UserId);
            return Result.Success(profileDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating user profile for user {UserId}", request.UserId);
            return Result.Failure<UserProfileDto>("An error occurred while updating the user profile");
        }
    }
}