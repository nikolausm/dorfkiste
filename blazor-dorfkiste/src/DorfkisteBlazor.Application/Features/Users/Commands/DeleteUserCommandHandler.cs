using DorfkisteBlazor.Application.Common.Interfaces;
using DorfkisteBlazor.Application.Common.Models;
using DorfkisteBlazor.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace DorfkisteBlazor.Application.Features.Users.Commands;

/// <summary>
/// Handler for DeleteUserCommand
/// </summary>
public class DeleteUserCommandHandler : ICommandHandler<DeleteUserCommand, Result<bool>>
{
    private readonly IRepository<Domain.Entities.User> _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<DeleteUserCommandHandler> _logger;

    public DeleteUserCommandHandler(
        IRepository<Domain.Entities.User> userRepository,
        IUnitOfWork unitOfWork,
        ILogger<DeleteUserCommandHandler> logger)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Check if requesting user is admin
            var requestingUser = await _userRepository.GetByIdAsync(request.RequestingUserId);
            if (requestingUser == null || !requestingUser.IsAdmin)
            {
                return Result.Failure<bool>("Unauthorized. Admin access required.");
            }

            // Prevent admin from deleting themselves
            if (request.RequestingUserId == request.UserId)
            {
                return Result.Failure<bool>("Cannot delete your own account.");
            }

            var user = await _userRepository.GetByIdAsync(request.UserId);
            if (user == null)
            {
                return Result.Failure<bool>("User not found");
            }

            // Check if user has active rentals
            var hasActiveRentals = user.RentalsAsOwner.Any(r => r.Status == "active") ||
                                  user.RentalsAsRenter.Any(r => r.Status == "active");
            
            if (hasActiveRentals)
            {
                return Result.Failure<bool>("Cannot delete user with active rentals. Please resolve all active rentals first.");
            }

            await _userRepository.DeleteAsync(user.Id);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Deleted user {UserId} by admin {AdminId}", request.UserId, request.RequestingUserId);
            return Result.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while deleting user {UserId}", request.UserId);
            return Result.Failure<bool>("An error occurred while deleting the user");
        }
    }
}