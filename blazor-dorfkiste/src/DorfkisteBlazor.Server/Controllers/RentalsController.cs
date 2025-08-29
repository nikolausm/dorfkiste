using DorfkisteBlazor.Application.Features.Rentals.Commands;
using DorfkisteBlazor.Application.Features.Rentals.Queries;
using DorfkisteBlazor.Application.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using DorfkisteBlazor.Application.Common.Models;
using DorfkisteBlazor.Application.Features.Items.DTOs;
using DorfkisteBlazor.Application.Features.Rentals.DTOs;
using MediatR;

namespace DorfkisteBlazor.Server.Controllers;

/// <summary>
/// API Controller for managing rentals
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RentalsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<RentalsController> _logger;

    public RentalsController(
        IMediator mediator,
        ILogger<RentalsController> logger)
    {
        _mediator = mediator;
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

            var result = await _mediator.Send(command);
            
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
            var query = new GetRentalByIdQuery { Id = id };
            var result = await _mediator.Send(query);
            
            if (result.IsFailure)
            {
                return BadRequest(result.Error);
            }

            if (result.Value == null)
            {
                return NotFound();
            }

            return Ok(result.Value);
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

            query.RenterId = userId.Value;
            var result = await _mediator.Send(query);
            
            if (result.IsFailure)
            {
                _logger.LogWarning("Failed to get rentals for user {UserId}: {Error}", userId, result.Error);
                return BadRequest(result.Error);
            }

            return Ok(result.Value);
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

            query.OwnerId = userId.Value;
            var result = await _mediator.Send(query);
            
            if (result.IsFailure)
            {
                _logger.LogWarning("Failed to get bookings for user {UserId}: {Error}", userId, result.Error);
                return BadRequest(result.Error);
            }

            return Ok(result.Value);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting user bookings");
            return StatusCode(500, "An error occurred while processing your request");
        }
    }

    /// <summary>
    /// Get all rentals with filtering and pagination (Admin/Public)
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<RentalsResponse>> GetRentals([FromQuery] GetRentalsQuery query)
    {
        try
        {
            var result = await _mediator.Send(query);
            
            if (result.IsFailure)
            {
                _logger.LogWarning("Failed to get rentals: {Error}", result.Error);
                return BadRequest(result.Error);
            }

            return Ok(result.Value);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting rentals");
            return StatusCode(500, "An error occurred while processing your request");
        }
    }

    /// <summary>
    /// Update an existing rental
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<RentalDto>> UpdateRental(Guid id, [FromBody] UpdateRentalRequest request)
    {
        try
        {
            var command = new UpdateRentalCommand
            {
                Id = id,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Status = request.Status,
                PaymentStatus = request.PaymentStatus,
                DeliveryRequested = request.DeliveryRequested,
                DeliveryAddress = request.DeliveryAddress
            };

            var result = await _mediator.Send(command);
            
            if (result.IsFailure)
            {
                _logger.LogWarning("Failed to update rental {RentalId}: {Error}", id, result.Error);
                return BadRequest(result.Error);
            }

            if (result.Value == null)
            {
                return NotFound();
            }

            _logger.LogInformation("Updated rental {RentalId} for user {UserId}", id, User.Identity?.Name);
            return Ok(result.Value);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating rental {RentalId}", id);
            return StatusCode(500, "An error occurred while processing your request");
        }
    }

    /// <summary>
    /// Delete a rental
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteRental(Guid id)
    {
        try
        {
            var command = new DeleteRentalCommand { Id = id };
            var result = await _mediator.Send(command);
            
            if (result.IsFailure)
            {
                _logger.LogWarning("Failed to delete rental {RentalId}: {Error}", id, result.Error);
                return BadRequest(result.Error);
            }

            _logger.LogInformation("Deleted rental {RentalId} for user {UserId}", id, User.Identity?.Name);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while deleting rental {RentalId}", id);
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

            var command = new UpdateRentalCommand
            {
                Id = id,
                Status = request.Status
            };

            var result = await _mediator.Send(command);
            
            if (result.IsFailure)
            {
                _logger.LogWarning("Failed to update rental status {RentalId}: {Error}", id, result.Error);
                return BadRequest(result.Error);
            }

            _logger.LogInformation("Updated rental {RentalId} status to {Status} for user {UserId}", 
                id, request.Status, userId);
            
            return Ok();
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

public class UpdateRentalRequest
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = "pending";
    public string PaymentStatus { get; set; } = "pending";
    public bool DeliveryRequested { get; set; } = false;
    public string? DeliveryAddress { get; set; }
}

public class UpdateRentalStatusRequest
{
    public required string Status { get; set; }
    public string? Reason { get; set; }
}

