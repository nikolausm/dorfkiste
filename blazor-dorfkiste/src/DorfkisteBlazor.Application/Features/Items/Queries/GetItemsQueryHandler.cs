using DorfkisteBlazor.Application.Common.Interfaces;
using DorfkisteBlazor.Application.Common.Models;
using DorfkisteBlazor.Application.Features.Items.DTOs;
using DorfkisteBlazor.Domain.Interfaces;
using DorfkisteBlazor.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DorfkisteBlazor.Application.Features.Items.Queries;

/// <summary>
/// Handler for GetItemsQuery with advanced filtering and search
/// </summary>
public class GetItemsQueryHandler : IQueryHandler<GetItemsQuery, Result<ItemsResponse>>
{
    private readonly IRepository<Item> _itemRepository;

    public GetItemsQueryHandler(IRepository<Item> itemRepository)
    {
        _itemRepository = itemRepository;
    }

    public async Task<Result<ItemsResponse>> Handle(GetItemsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var query = _itemRepository.GetQueryable()
                .Include(i => i.User)
                .Include(i => i.Category)
                .Include(i => i.Images.OrderBy(img => img.Order))
                .AsQueryable();

            // Apply filters
            if (request.AvailableOnly)
            {
                query = query.Where(i => i.Available);
            }

            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                var searchTerm = request.SearchTerm.ToLower();
                query = query.Where(i => 
                    i.Title.ToLower().Contains(searchTerm) ||
                    (i.Description != null && i.Description.ToLower().Contains(searchTerm)) ||
                    i.Location.ToLower().Contains(searchTerm));
            }

            if (request.CategoryId.HasValue)
            {
                query = query.Where(i => i.CategoryId == request.CategoryId.Value);
            }

            if (!string.IsNullOrWhiteSpace(request.Location))
            {
                query = query.Where(i => i.Location.ToLower().Contains(request.Location.ToLower()));
            }

            if (request.MinPrice.HasValue)
            {
                query = query.Where(i => i.PricePerDay >= request.MinPrice.Value || i.PricePerHour >= request.MinPrice.Value);
            }

            if (request.MaxPrice.HasValue)
            {
                query = query.Where(i => i.PricePerDay <= request.MaxPrice.Value || i.PricePerHour <= request.MaxPrice.Value);
            }

            if (!string.IsNullOrWhiteSpace(request.Condition))
            {
                query = query.Where(i => i.Condition.ToLower() == request.Condition.ToLower());
            }

            if (request.DeliveryAvailable.HasValue)
            {
                query = query.Where(i => i.DeliveryAvailable == request.DeliveryAvailable.Value);
            }

            // Apply sorting
            query = request.SortBy.ToLower() switch
            {
                "title" => request.SortDirection.ToLower() == "desc" 
                    ? query.OrderByDescending(i => i.Title)
                    : query.OrderBy(i => i.Title),
                "price" => request.SortDirection.ToLower() == "desc"
                    ? query.OrderByDescending(i => i.PricePerDay ?? i.PricePerHour ?? 0)
                    : query.OrderBy(i => i.PricePerDay ?? i.PricePerHour ?? 0),
                "location" => request.SortDirection.ToLower() == "desc"
                    ? query.OrderByDescending(i => i.Location)
                    : query.OrderBy(i => i.Location),
                _ => request.SortDirection.ToLower() == "desc"
                    ? query.OrderByDescending(i => i.CreatedAt)
                    : query.OrderBy(i => i.CreatedAt)
            };

            // Get total count before pagination
            var totalCount = await query.CountAsync(cancellationToken);

            // Apply pagination
            var items = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(i => new ItemDto
                {
                    Id = i.Id,
                    Title = i.Title,
                    Description = i.Description,
                    Condition = i.Condition,
                    PricePerDay = i.PricePerDay,
                    PricePerHour = i.PricePerHour,
                    Deposit = i.Deposit,
                    Available = i.Available,
                    Location = i.Location,
                    Latitude = i.Latitude,
                    Longitude = i.Longitude,
                    DeliveryAvailable = i.DeliveryAvailable,
                    DeliveryFee = i.DeliveryFee,
                    DeliveryRadius = i.DeliveryRadius,
                    PickupAvailable = i.PickupAvailable,
                    CreatedAt = i.CreatedAt,
                    UpdatedAt = i.UpdatedAt,
                    UserId = i.UserId,
                    UserName = i.User.Name,
                    UserAvatarUrl = i.User.AvatarUrl,
                    CategoryId = i.CategoryId,
                    CategoryName = i.Category.Name,
                    CategorySlug = i.Category.Slug,
                    Images = i.Images.Select(img => new ItemImageDto
                    {
                        Id = img.Id,
                        Url = img.Url,
                        Order = img.Order
                    })
                })
                .ToListAsync(cancellationToken);

            var response = new ItemsResponse
            {
                Items = items,
                TotalCount = totalCount,
                Page = request.Page,
                PageSize = request.PageSize
            };

            return Result.Success(response);
        }
        catch (Exception ex)
        {
            return Result.Failure<ItemsResponse>($"Error retrieving items: {ex.Message}");
        }
    }
}