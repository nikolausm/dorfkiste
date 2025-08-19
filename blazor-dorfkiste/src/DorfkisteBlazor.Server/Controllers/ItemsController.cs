using DorfkisteBlazor.Application.Features.Items.Queries;
using DorfkisteBlazor.Application.Common.Interfaces;
using DorfkisteBlazor.Application.Common.Models;
using DorfkisteBlazor.Application.Features.Items.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace DorfkisteBlazor.Server.Controllers;

/// <summary>
/// API Controller for managing items
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ItemsController : ControllerBase
{
    private readonly IQueryHandler<GetItemsQuery, Result<ItemsResponse>> _getItemsHandler;
    private readonly ILogger<ItemsController> _logger;

    public ItemsController(
        IQueryHandler<GetItemsQuery, Result<ItemsResponse>> getItemsHandler,
        ILogger<ItemsController> logger)
    {
        _getItemsHandler = getItemsHandler;
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
    public async Task<ActionResult<ItemDto>> CreateItem([FromBody] CreateItemRequest request)
    {
        try
        {
            // TODO: Implement CreateItemCommand and handler
            _logger.LogInformation("Creating item for user {UserId}", User.Identity?.Name);
            
            return StatusCode(501, "Not implemented yet");
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