using DorfkisteBlazor.Application.Features.Items.Queries;
using DorfkisteBlazor.Application.Features.Items.Commands;
using DorfkisteBlazor.Application.Common.Interfaces;
using DorfkisteBlazor.Application.Common.Models;
using DorfkisteBlazor.Application.Features.Items.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MediatR;
using System.Security.Claims;

namespace DorfkisteBlazor.Server.Controllers;

/// <summary>
/// API Controller for managing items
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ItemsController : ControllerBase
{
    private readonly IQueryHandler<GetItemsQuery, Result<ItemsResponse>> _getItemsHandler;
    private readonly IMediator _mediator;
    private readonly ILogger<ItemsController> _logger;

    public ItemsController(
        IQueryHandler<GetItemsQuery, Result<ItemsResponse>> getItemsHandler,
        IMediator mediator,
        ILogger<ItemsController> logger)
    {
        _getItemsHandler = getItemsHandler;
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get items with filtering and pagination
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ItemsResponse>> GetItems([FromQuery] GetItemsQuery query)
    {
        try
        {
            var result = await _getItemsHandler.Handle(query, CancellationToken.None);
            
            if (result.IsFailure)
            {
                _logger.LogWarning("Failed to get items: {Error}", result.Error);
                return BadRequest(result.Error);
            }

            return Ok(result.Value);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting items");
            return StatusCode(500, "An error occurred while processing your request");
        }
    }

    /// <summary>
    /// Get a specific item by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ItemDto>> GetItem(Guid id)
    {
        try
        {
            var query = new GetItemsQuery 
            { 
                AvailableOnly = false,
                PageSize = 1
            };
            
            // TODO: Create GetItemByIdQuery for better performance
            var result = await _getItemsHandler.Handle(query, CancellationToken.None);
            
            if (result.IsFailure)
            {
                return BadRequest(result.Error);
            }

            var item = result.Value.Items.FirstOrDefault(i => i.Id == id);
            if (item == null)
            {
                return NotFound();
            }

            return Ok(item);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting item {ItemId}", id);
            return StatusCode(500, "An error occurred while processing your request");
        }
    }

    /// <summary>
    /// Create a new item (requires authentication)
    /// </summary>
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<CreateItemResponse>> CreateItem([FromBody] CreateItemRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized("User not authenticated");
            }

            var command = new CreateItemCommand
            {
                Title = request.Title,
                Description = request.Description,
                Condition = request.Condition,
                PricePerDay = request.PricePerDay,
                PricePerHour = request.PricePerHour,
                Deposit = request.Deposit,
                Location = request.Location,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                DeliveryAvailable = request.DeliveryAvailable,
                DeliveryFee = request.DeliveryFee,
                DeliveryRadius = request.DeliveryRadius,
                DeliveryDetails = request.DeliveryDetails,
                PickupAvailable = request.PickupAvailable,
                CategoryId = request.CategoryId,
                UserId = userId.Value,
                ImageUrls = request.ImageUrls
            };

            var result = await _mediator.Send(command);
            
            if (result.IsFailure)
            {
                _logger.LogWarning("Failed to create item for user {UserId}: {Error}", userId, result.Error);
                return BadRequest(result.Error);
            }

            _logger.LogInformation("Created item {ItemId} for user {UserId}", result.Value.ItemId, userId);
            return CreatedAtAction(nameof(GetItem), new { id = result.Value.ItemId }, result.Value);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while creating item");
            return StatusCode(500, "An error occurred while processing your request");
        }
    }

    /// <summary>
    /// Update an existing item (requires authentication and ownership)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<ItemDto>> UpdateItem(Guid id, [FromBody] UpdateItemRequest request)
    {
        try
        {
            // TODO: Implement UpdateItemCommand and handler
            _logger.LogInformation("Updating item {ItemId} for user {UserId}", id, User.Identity?.Name);
            
            return StatusCode(501, "Not implemented yet");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating item {ItemId}", id);
            return StatusCode(500, "An error occurred while processing your request");
        }
    }

    /// <summary>
    /// Delete an item (requires authentication and ownership)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<ActionResult> DeleteItem(Guid id)
    {
        try
        {
            // TODO: Implement DeleteItemCommand and handler
            _logger.LogInformation("Deleting item {ItemId} for user {UserId}", id, User.Identity?.Name);
            
            return StatusCode(501, "Not implemented yet");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while deleting item {ItemId}", id);
            return StatusCode(500, "An error occurred while processing your request");
        }
    }

    private Guid? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}

public class CreateItemRequest
{
    public required string Title { get; set; }
    public string? Description { get; set; }
    public required string Condition { get; set; }
    public decimal? PricePerDay { get; set; }
    public decimal? PricePerHour { get; set; }
    public decimal? Deposit { get; set; }
    public required string Location { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public bool DeliveryAvailable { get; set; }
    public decimal? DeliveryFee { get; set; }
    public double? DeliveryRadius { get; set; }
    public string? DeliveryDetails { get; set; }
    public bool PickupAvailable { get; set; } = true;
    public Guid CategoryId { get; set; }
    public List<string> ImageUrls { get; set; } = new();
}

public class UpdateItemRequest : CreateItemRequest
{
    public bool Available { get; set; } = true;
}