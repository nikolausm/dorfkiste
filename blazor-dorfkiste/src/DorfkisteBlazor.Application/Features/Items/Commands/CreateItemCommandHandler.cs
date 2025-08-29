using DorfkisteBlazor.Application.Common.Interfaces;
using DorfkisteBlazor.Application.Common.Models;
using DorfkisteBlazor.Application.Features.Items.DTOs;
using DorfkisteBlazor.Domain.Interfaces;
using DorfkisteBlazor.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DorfkisteBlazor.Application.Features.Items.Commands;

/// <summary>
/// Handler for CreateItemCommand with validation and business logic
/// </summary>
public class CreateItemCommandHandler : ICommandHandler<CreateItemCommand, Result<CreateItemResponse>>
{
    private readonly IRepository<Item> _itemRepository;
    private readonly IRepository<Category> _categoryRepository;
    private readonly IRepository<User> _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateItemCommandHandler(
        IRepository<Item> itemRepository,
        IRepository<Category> categoryRepository,
        IRepository<User> userRepository,
        IUnitOfWork unitOfWork)
    {
        _itemRepository = itemRepository;
        _categoryRepository = categoryRepository;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CreateItemResponse>> Handle(CreateItemCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Validate user exists
            var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
            if (user == null)
            {
                return Result.Failure<CreateItemResponse>("User not found");
            }

            // Validate category exists
            var category = await _categoryRepository.GetByIdAsync(request.CategoryId, cancellationToken);
            if (category == null)
            {
                return Result.Failure<CreateItemResponse>("Category not found");
            }

            // Validate condition
            var validConditions = new[] { "neu", "sehr gut", "gut", "gebraucht" };
            if (!validConditions.Contains(request.Condition.ToLower()))
            {
                return Result.Failure<CreateItemResponse>("Invalid condition. Must be one of: neu, sehr gut, gut, gebraucht");
            }

            // Validate pricing
            if (request.PricePerDay == null && request.PricePerHour == null)
            {
                return Result.Failure<CreateItemResponse>("At least one pricing option (per day or per hour) must be specified");
            }

            if (request.PricePerDay.HasValue && request.PricePerDay <= 0)
            {
                return Result.Failure<CreateItemResponse>("Price per day must be greater than 0");
            }

            if (request.PricePerHour.HasValue && request.PricePerHour <= 0)
            {
                return Result.Failure<CreateItemResponse>("Price per hour must be greater than 0");
            }

            if (request.Deposit.HasValue && request.Deposit < 0)
            {
                return Result.Failure<CreateItemResponse>("Deposit cannot be negative");
            }

            // Validate delivery options
            if (request.DeliveryAvailable)
            {
                if (request.DeliveryFee.HasValue && request.DeliveryFee < 0)
                {
                    return Result.Failure<CreateItemResponse>("Delivery fee cannot be negative");
                }

                if (request.DeliveryRadius.HasValue && request.DeliveryRadius <= 0)
                {
                    return Result.Failure<CreateItemResponse>("Delivery radius must be greater than 0");
                }
            }

            // Validate coordinates if provided
            if (request.Latitude.HasValue && (request.Latitude < -90 || request.Latitude > 90))
            {
                return Result.Failure<CreateItemResponse>("Latitude must be between -90 and 90");
            }

            if (request.Longitude.HasValue && (request.Longitude < -180 || request.Longitude > 180))
            {
                return Result.Failure<CreateItemResponse>("Longitude must be between -180 and 180");
            }

            // Create the item
            var item = new Item
            {
                Title = request.Title.Trim(),
                Description = request.Description?.Trim(),
                Condition = request.Condition.ToLower(),
                PricePerDay = request.PricePerDay,
                PricePerHour = request.PricePerHour,
                Deposit = request.Deposit,
                Available = true,
                Location = request.Location.Trim(),
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                DeliveryAvailable = request.DeliveryAvailable,
                DeliveryFee = request.DeliveryAvailable ? request.DeliveryFee : null,
                DeliveryRadius = request.DeliveryAvailable ? request.DeliveryRadius : null,
                DeliveryDetails = request.DeliveryAvailable ? request.DeliveryDetails?.Trim() : null,
                PickupAvailable = request.PickupAvailable,
                UserId = request.UserId,
                CategoryId = request.CategoryId
            };

            await _itemRepository.AddAsync(item, cancellationToken);
            
            // Create item images if provided
            if (request.ImageUrls.Any())
            {
                var order = 0;
                foreach (var imageUrl in request.ImageUrls.Where(url => !string.IsNullOrWhiteSpace(url)))
                {
                    var itemImage = new ItemImage
                    {
                        ItemId = item.Id,
                        Url = imageUrl.Trim(),
                        Order = order++
                    };
                    item.Images.Add(itemImage);
                }
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var response = new CreateItemResponse
            {
                ItemId = item.Id,
                Title = item.Title,
                Description = item.Description,
                Condition = item.Condition,
                PricePerDay = item.PricePerDay,
                PricePerHour = item.PricePerHour,
                Deposit = item.Deposit,
                Available = item.Available,
                Location = item.Location,
                Latitude = item.Latitude,
                Longitude = item.Longitude,
                DeliveryAvailable = item.DeliveryAvailable,
                DeliveryFee = item.DeliveryFee,
                DeliveryRadius = item.DeliveryRadius,
                DeliveryDetails = item.DeliveryDetails,
                PickupAvailable = item.PickupAvailable,
                UserId = item.UserId,
                CategoryId = item.CategoryId,
                CreatedAt = item.CreatedAt,
                ImageUrls = item.Images.OrderBy(i => i.Order).Select(i => i.Url).ToList()
            };

            return Result.Success(response);
        }
        catch (Exception ex)
        {
            return Result.Failure<CreateItemResponse>($"Error creating item: {ex.Message}");
        }
    }
}