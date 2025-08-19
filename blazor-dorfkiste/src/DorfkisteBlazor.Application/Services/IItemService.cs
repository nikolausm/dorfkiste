using DorfkisteBlazor.Application.Common.Models;
using DorfkisteBlazor.Application.Features.Items.DTOs;

namespace DorfkisteBlazor.Application.Services;

/// <summary>
/// Service interface for item management
/// </summary>
public interface IItemService
{
    /// <summary>
    /// Create a new item
    /// </summary>
    Task<Result<ItemDto>> CreateItemAsync(CreateItemDto dto);

    /// <summary>
    /// Update an existing item
    /// </summary>
    Task<Result<ItemDto>> UpdateItemAsync(Guid itemId, UpdateItemDto dto, Guid userId);

    /// <summary>
    /// Delete an item (soft delete)
    /// </summary>
    Task<Result<bool>> DeleteItemAsync(Guid itemId, Guid userId);

    /// <summary>
    /// Get item by ID with availability check
    /// </summary>
    Task<Result<ItemDto>> GetItemByIdAsync(Guid itemId);

    /// <summary>
    /// Search items with advanced filtering
    /// </summary>
    Task<Result<ItemsResponse>> SearchItemsAsync(ItemSearchDto searchDto);

    /// <summary>
    /// Get similar items based on category and location
    /// </summary>
    Task<Result<List<ItemDto>>> GetSimilarItemsAsync(Guid itemId, int limit = 5);

    /// <summary>
    /// Check item availability for specific dates
    /// </summary>
    Task<Result<ItemAvailabilityDto>> CheckAvailabilityAsync(Guid itemId, DateTime startDate, DateTime endDate);

    /// <summary>
    /// Get user's items
    /// </summary>
    Task<Result<ItemsResponse>> GetUserItemsAsync(Guid userId, int page = 1, int pageSize = 20);

    /// <summary>
    /// Update item availability status
    /// </summary>
    Task<Result<bool>> UpdateAvailabilityAsync(Guid itemId, bool available, Guid userId);

    /// <summary>
    /// Upload and associate images with item
    /// </summary>
    Task<Result<List<ItemImageDto>>> UploadImagesAsync(Guid itemId, List<UploadImageDto> images, Guid userId);

    /// <summary>
    /// Delete an item image
    /// </summary>
    Task<Result<bool>> DeleteImageAsync(Guid itemId, Guid imageId, Guid userId);

    /// <summary>
    /// Reorder item images
    /// </summary>
    Task<Result<bool>> ReorderImagesAsync(Guid itemId, List<ImageOrderDto> imageOrders, Guid userId);
}

public class CreateItemDto
{
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public string Condition { get; set; } = "";
    public decimal? PricePerDay { get; set; }
    public decimal? PricePerHour { get; set; }
    public decimal? Deposit { get; set; }
    public string Location { get; set; } = "";
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public bool DeliveryAvailable { get; set; }
    public decimal? DeliveryFee { get; set; }
    public double? DeliveryRadius { get; set; }
    public string? DeliveryDetails { get; set; }
    public bool PickupAvailable { get; set; } = true;
    public Guid CategoryId { get; set; }
    public Guid UserId { get; set; }
    public List<string> ImageUrls { get; set; } = new();
}

public class UpdateItemDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Condition { get; set; }
    public decimal? PricePerDay { get; set; }
    public decimal? PricePerHour { get; set; }
    public decimal? Deposit { get; set; }
    public string? Location { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public bool? DeliveryAvailable { get; set; }
    public decimal? DeliveryFee { get; set; }
    public double? DeliveryRadius { get; set; }
    public string? DeliveryDetails { get; set; }
    public bool? PickupAvailable { get; set; }
    public Guid? CategoryId { get; set; }
    public bool? Available { get; set; }
}

public class ItemSearchDto
{
    public string? SearchTerm { get; set; }
    public Guid? CategoryId { get; set; }
    public string? Location { get; set; }
    public double? LocationRadius { get; set; } // km
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public string? Condition { get; set; }
    public bool? DeliveryAvailable { get; set; }
    public bool AvailableOnly { get; set; } = true;
    public DateTime? AvailableFrom { get; set; }
    public DateTime? AvailableTo { get; set; }
    public string SortBy { get; set; } = "CreatedAt";
    public string SortDirection { get; set; } = "desc";
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class ItemAvailabilityDto
{
    public bool Available { get; set; }
    public List<DateRange> UnavailablePeriods { get; set; } = new();
    public List<DateRange> PendingPeriods { get; set; } = new();
    public string? Message { get; set; }
}

public class DateRange
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? Reason { get; set; }
}

public class UploadImageDto
{
    public string Url { get; set; } = "";
    public int Order { get; set; }
}

public class ImageOrderDto
{
    public Guid ImageId { get; set; }
    public int Order { get; set; }
}