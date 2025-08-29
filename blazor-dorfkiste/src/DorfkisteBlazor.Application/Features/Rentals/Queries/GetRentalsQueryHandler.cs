using DorfkisteBlazor.Application.Common.Interfaces;
using DorfkisteBlazor.Application.Common.Models;
using DorfkisteBlazor.Application.Features.Rentals.DTOs;
using DorfkisteBlazor.Domain.Interfaces;
using DorfkisteBlazor.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DorfkisteBlazor.Application.Features.Rentals.Queries;

/// <summary>
/// Handler for GetRentalsQuery with advanced filtering and search
/// </summary>
public class GetRentalsQueryHandler : IQueryHandler<GetRentalsQuery, Result<RentalsResponse>>
{
    private readonly IRepository<Rental> _rentalRepository;

    public GetRentalsQueryHandler(IRepository<Rental> rentalRepository)
    {
        _rentalRepository = rentalRepository;
    }

    public async Task<Result<RentalsResponse>> Handle(GetRentalsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var query = _rentalRepository.GetQueryable()
                .Include(r => r.Item)
                    .ThenInclude(i => i.Images.OrderBy(img => img.Order))
                .Include(r => r.Owner)
                .Include(r => r.Renter)
                .AsQueryable();

            // Apply filters
            if (request.ItemId.HasValue)
            {
                query = query.Where(r => r.ItemId == request.ItemId.Value);
            }

            if (request.OwnerId.HasValue)
            {
                query = query.Where(r => r.OwnerId == request.OwnerId.Value);
            }

            if (request.RenterId.HasValue)
            {
                query = query.Where(r => r.RenterId == request.RenterId.Value);
            }

            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                query = query.Where(r => r.Status.ToLower() == request.Status.ToLower());
            }

            if (!string.IsNullOrWhiteSpace(request.PaymentStatus))
            {
                query = query.Where(r => r.PaymentStatus.ToLower() == request.PaymentStatus.ToLower());
            }

            if (request.StartDateFrom.HasValue)
            {
                query = query.Where(r => r.StartDate >= request.StartDateFrom.Value);
            }

            if (request.StartDateTo.HasValue)
            {
                query = query.Where(r => r.StartDate <= request.StartDateTo.Value);
            }

            if (request.EndDateFrom.HasValue)
            {
                query = query.Where(r => r.EndDate >= request.EndDateFrom.Value);
            }

            if (request.EndDateTo.HasValue)
            {
                query = query.Where(r => r.EndDate <= request.EndDateTo.Value);
            }

            if (request.DeliveryRequested.HasValue)
            {
                query = query.Where(r => r.DeliveryRequested == request.DeliveryRequested.Value);
            }

            // Apply sorting
            query = request.SortBy.ToLower() switch
            {
                "startdate" => request.SortDirection.ToLower() == "desc" 
                    ? query.OrderByDescending(r => r.StartDate)
                    : query.OrderBy(r => r.StartDate),
                "enddate" => request.SortDirection.ToLower() == "desc"
                    ? query.OrderByDescending(r => r.EndDate)
                    : query.OrderBy(r => r.EndDate),
                "totalprice" => request.SortDirection.ToLower() == "desc"
                    ? query.OrderByDescending(r => r.TotalPrice)
                    : query.OrderBy(r => r.TotalPrice),
                "status" => request.SortDirection.ToLower() == "desc"
                    ? query.OrderByDescending(r => r.Status)
                    : query.OrderBy(r => r.Status),
                _ => request.SortDirection.ToLower() == "desc"
                    ? query.OrderByDescending(r => r.CreatedAt)
                    : query.OrderBy(r => r.CreatedAt)
            };

            // Get total count before pagination
            var totalCount = await query.CountAsync(cancellationToken);

            // Apply pagination
            var rentals = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(r => new RentalDto
                {
                    Id = r.Id,
                    StartDate = r.StartDate,
                    EndDate = r.EndDate,
                    TotalPrice = r.TotalPrice,
                    DepositPaid = r.DepositPaid,
                    PlatformFee = r.PlatformFee,
                    Status = r.Status,
                    PaymentStatus = r.PaymentStatus,
                    PaymentMethod = r.PaymentMethod,
                    StripePaymentIntentId = r.StripePaymentIntentId,
                    PaypalOrderId = r.PaypalOrderId,
                    DeliveryRequested = r.DeliveryRequested,
                    DeliveryAddress = r.DeliveryAddress,
                    DeliveryFee = r.DeliveryFee,
                    ItemId = r.ItemId,
                    OwnerId = r.OwnerId,
                    RenterId = r.RenterId,
                    ItemTitle = r.Item.Title,
                    OwnerName = r.Owner.Name,
                    RenterName = r.Renter.Name,
                    ItemImageUrl = r.Item.Images.FirstOrDefault() != null ? r.Item.Images.First().Url : null,
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt,
                    CreatedBy = r.CreatedBy,
                    UpdatedBy = r.UpdatedBy
                })
                .ToListAsync(cancellationToken);

            var response = new RentalsResponse
            {
                Rentals = rentals,
                TotalCount = totalCount,
                Page = request.Page,
                PageSize = request.PageSize
            };

            return Result.Success(response);
        }
        catch (Exception ex)
        {
            return Result.Failure<RentalsResponse>($"Error retrieving rentals: {ex.Message}");
        }
    }
}