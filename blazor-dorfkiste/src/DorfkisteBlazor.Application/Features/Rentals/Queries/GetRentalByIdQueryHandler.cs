using DorfkisteBlazor.Application.Common.Interfaces;
using DorfkisteBlazor.Application.Common.Models;
using DorfkisteBlazor.Application.Features.Rentals.DTOs;
using DorfkisteBlazor.Domain.Interfaces;
using DorfkisteBlazor.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DorfkisteBlazor.Application.Features.Rentals.Queries;

/// <summary>
/// Handler for GetRentalByIdQuery
/// </summary>
public class GetRentalByIdQueryHandler : IQueryHandler<GetRentalByIdQuery, Result<RentalDto?>>
{
    private readonly IRepository<Rental> _rentalRepository;

    public GetRentalByIdQueryHandler(IRepository<Rental> rentalRepository)
    {
        _rentalRepository = rentalRepository;
    }

    public async Task<Result<RentalDto?>> Handle(GetRentalByIdQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var rental = await _rentalRepository.GetQueryable()
                .Include(r => r.Item)
                    .ThenInclude(i => i.Images.OrderBy(img => img.Order))
                .Include(r => r.Owner)
                .Include(r => r.Renter)
                .Where(r => r.Id == request.Id)
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
                .FirstOrDefaultAsync(cancellationToken);

            return Result.Success(rental);
        }
        catch (Exception ex)
        {
            return Result.Failure<RentalDto?>($"Error retrieving rental: {ex.Message}");
        }
    }
}