using DorfkisteBlazor.Application.Features.Rentals.Commands;
using DorfkisteBlazor.Application.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using DorfkisteBlazor.Application.Common.Models;
using DorfkisteBlazor.Application.Features.Items.DTOs;
using DorfkisteBlazor.Application.Features.Rentals.DTOs;

namespace DorfkisteBlazor.Server.Controllers;

/// <summary>
/// API Controller for managing rentals
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RentalsController : ControllerBase
{
    private readonly ICommandHandler<CreateRentalCommand, Result<CreateRentalResponse>> _createRentalHandler;
    private readonly ILogger<RentalsController> _logger;

    public RentalsController(
        ICommandHandler<CreateRentalCommand, Result<CreateRentalResponse>> createRentalHandler,
        ILogger<RentalsController> logger)
    {
        _createRentalHandler = createRentalHandler;
        _logger = logger;
    }

    /// <summary>
    /// Create a new rental booking
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<CreateRentalResponse>> CreateRental([FromBody] CreateRentalRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized("User not authenticated");
            }

            var command = new CreateRentalCommand
            {
                ItemId = request.ItemId,
                RenterId = userId.Value,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                DeliveryRequested = request.DeliveryRequested,
                DeliveryAddress = request.DeliveryAddress,
                PaymentMethod = request.PaymentMethod
            };

            var result = await _createRentalHandler.Handle(command, CancellationToken.None);
            
            if (result.IsFailure)
            {
                _logger.LogWarning("Failed to create rental: {Error}", result.Error);
                return BadRequest(result.Error);
            }

            _logger.LogInformation("Created rental {RentalId} for user {UserId}", result.Value.RentalId, userId);
            return CreatedAtAction(nameof(GetRental), new { id = result.Value.RentalId }, result.Value);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while creating rental");
            return StatusCode(500, "An error occurred while processing your request");
        }
    }

    /// <summary>
    /// Get a specific rental by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<RentalDto>> GetRental(Guid id)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized("User not authenticated");
            }

            // TODO: Implement GetRentalByIdQuery and handler
            _logger.LogInformation("Getting rental {RentalId} for user {UserId}", id, userId);
            
            return StatusCode(501, "Not implemented yet");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting rental {RentalId}", id);
            return StatusCode(500, "An error occurred while processing your request");
        }
    }

    /// <summary>
    /// Get user's rentals (as renter)
    /// </summary>
    [HttpGet("my-rentals")]
    public async Task<ActionResult<RentalsResponse>> GetMyRentals([FromQuery] GetRentalsQuery query)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized("User not authenticated");
            }

            // TODO: Implement GetRentalsQuery and handler
            _logger.LogInformation("Getting rentals for user {UserId}", userId);
            
            return StatusCode(501, "Not implemented yet");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting user rentals");
            return StatusCode(500, "An error occurred while processing your request");
        }
    }

    /// <summary>
    /// Get rentals for user's items (as owner)
    /// </summary>
    [HttpGet("my-bookings")]
    public async Task<ActionResult<RentalsResponse>> GetMyBookings([FromQuery] GetRentalsQuery query)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized("User not authenticated");
            }

            // TODO: Implement GetRentalsQuery with owner filter
            _logger.LogInformation("Getting bookings for user {UserId}", userId);
            
            return StatusCode(501, "Not implemented yet");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting user bookings");
            return StatusCode(500, "An error occurred while processing your request");
        }
    }

    /// <summary>
    /// Update rental status
    /// </summary>
    [HttpPatch("{id}/status")]
    public async Task<ActionResult> UpdateRentalStatus(Guid id, [FromBody] UpdateRentalStatusRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized("User not authenticated");
            }

            // TODO: Implement UpdateRentalStatusCommand and handler
            _logger.LogInformation("Updating rental {RentalId} status to {Status} for user {UserId}", 
                id, request.Status, userId);
            
            return StatusCode(501, "Not implemented yet");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating rental status for {RentalId}", id);
            return StatusCode(500, "An error occurred while processing your request");
        }
    }

    private Guid? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}

public class CreateRentalRequest
{
    public Guid ItemId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool DeliveryRequested { get; set; }
    public string? DeliveryAddress { get; set; }
    public string PaymentMethod { get; set; } = "stripe";
}

public class GetRentalsQuery
{
    public string? Status { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class UpdateRentalStatusRequest
{
    public required string Status { get; set; }
    public string? Reason { get; set; }
}

public class RentalDto
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
    
    // Related entities
    public ItemDto? Item { get; set; }
    public UserDto? Owner { get; set; }
    public UserDto? Renter { get; set; }
}

public class RentalsResponse
{
    public IEnumerable<RentalDto> Rentals { get; set; } = new List<RentalDto>();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}

public class UserDto
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? AvatarUrl { get; set; }
    public bool Verified { get; set; }
}