using DorfkisteBlazor.Application.Features.Users.Commands;
using DorfkisteBlazor.Application.Features.Users.Queries;
using DorfkisteBlazor.Application.Features.Users.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using MediatR;

namespace DorfkisteBlazor.Server.Controllers;

/// <summary>
/// API Controller for managing users
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<UsersController> _logger;

    public UsersController(
        IMediator mediator,
        ILogger<UsersController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get current user's profile
    /// </summary>
    [HttpGet("profile")]
    public async Task<ActionResult<UserProfileDto>> GetProfile()
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized("User not authenticated");
            }

            var query = new GetUserProfileQuery { UserId = userId.Value };
            var result = await _mediator.Send(query);
            
            if (result.IsFailure)
            {
                _logger.LogWarning("Failed to get user profile for {UserId}: {Error}", userId, result.Error);
                return BadRequest(result.Error);
            }

            if (result.Value == null)
            {
                return NotFound("User profile not found");
            }

            return Ok(result.Value);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting user profile");
            return StatusCode(500, "An error occurred while processing your request");
        }
    }

    /// <summary>
    /// Update current user's profile
    /// </summary>
    [HttpPut("profile")]
    public async Task<ActionResult<UserProfileDto>> UpdateProfile([FromBody] UpdateUserProfileRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized("User not authenticated");
            }

            var command = new UpdateUserProfileCommand
            {
                UserId = userId.Value,
                Name = request.Name,
                Bio = request.Bio,
                AvatarUrl = request.AvatarUrl,
                PaypalEmail = request.PaypalEmail
            };

            var result = await _mediator.Send(command);
            
            if (result.IsFailure)
            {
                _logger.LogWarning("Failed to update user profile for {UserId}: {Error}", userId, result.Error);
                return BadRequest(result.Error);
            }

            _logger.LogInformation("Updated profile for user {UserId}", userId);
            return Ok(result.Value);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating user profile");
            return StatusCode(500, "An error occurred while processing your request");
        }
    }

    /// <summary>
    /// Get all users (admin only, paginated)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UsersResponse>> GetUsers([FromQuery] GetUsersQuery query)
    {
        try
        {
            var result = await _mediator.Send(query);
            
            if (result.IsFailure)
            {
                _logger.LogWarning("Failed to get users: {Error}", result.Error);
                return BadRequest(result.Error);
            }

            return Ok(result.Value);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting users");
            return StatusCode(500, "An error occurred while processing your request");
        }
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<UserProfileDto>> GetUser(Guid id)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null)
            {
                return Unauthorized("User not authenticated");
            }

            // Users can only view their own profile unless they're admin
            if (currentUserId != id && !IsCurrentUserAdmin())
            {
                return Forbid("Access denied. You can only view your own profile.");
            }

            var query = new GetUserProfileQuery { UserId = id };
            var result = await _mediator.Send(query);
            
            if (result.IsFailure)
            {
                _logger.LogWarning("Failed to get user {UserId}: {Error}", id, result.Error);
                return BadRequest(result.Error);
            }

            if (result.Value == null)
            {
                return NotFound("User not found");
            }

            return Ok(result.Value);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting user {UserId}", id);
            return StatusCode(500, "An error occurred while processing your request");
        }
    }

    /// <summary>
    /// Delete user (admin only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteUser(Guid id)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null)
            {
                return Unauthorized("User not authenticated");
            }

            var command = new DeleteUserCommand 
            { 
                UserId = id,
                RequestingUserId = currentUserId.Value
            };
            
            var result = await _mediator.Send(command);
            
            if (result.IsFailure)
            {
                _logger.LogWarning("Failed to delete user {UserId}: {Error}", id, result.Error);
                return BadRequest(result.Error);
            }

            _logger.LogInformation("Deleted user {UserId} by admin {AdminId}", id, currentUserId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while deleting user {UserId}", id);
            return StatusCode(500, "An error occurred while processing your request");
        }
    }

    private Guid? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    private bool IsCurrentUserAdmin()
    {
        return User.IsInRole("Admin") || 
               User.FindFirst("IsAdmin")?.Value?.ToLower() == "true";
    }
}

/// <summary>
/// Request model for updating user profile
/// </summary>
public class UpdateUserProfileRequest
{
    public string? Name { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public string? PaypalEmail { get; set; }
}