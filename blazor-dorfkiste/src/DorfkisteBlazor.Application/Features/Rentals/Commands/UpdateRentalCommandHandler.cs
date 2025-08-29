using DorfkisteBlazor.Application.Common.Interfaces;
using DorfkisteBlazor.Application.Common.Models;
using DorfkisteBlazor.Application.Features.Rentals.DTOs;
using DorfkisteBlazor.Domain.Interfaces;
using DorfkisteBlazor.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DorfkisteBlazor.Application.Features.Rentals.Commands;

/// <summary>
/// Handler for UpdateRentalCommand
/// </summary>
public class UpdateRentalCommandHandler : ICommandHandler<UpdateRentalCommand, Result<RentalDto?>>
{
    private readonly IRepository<Rental> _rentalRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateRentalCommandHandler(
        IRepository<Rental> rentalRepository,
        IUnitOfWork unitOfWork)
    {
        _rentalRepository = rentalRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<RentalDto?>> Handle(UpdateRentalCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Find the rental
            var rental = await _rentalRepository.GetQueryable()
                .Include(r => r.Item)
                    .ThenInclude(i => i.Images.OrderBy(img => img.Order))
                .Include(r => r.Owner)
                .Include(r => r.Renter)
                .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

            if (rental == null)
            {
                return Result.Failure<RentalDto?>("Rental not found");
            }

            // Validate date range
            if (request.StartDate >= request.EndDate)
            {
                return Result.Failure<RentalDto?>("Start date must be before end date");
            }

            if (request.StartDate < DateTime.UtcNow.Date)
            {
                return Result.Failure<RentalDto?>("Start date cannot be in the past");
            }

            // Update rental properties
            rental.StartDate = request.StartDate;
            rental.EndDate = request.EndDate;
            rental.Status = request.Status;
            rental.PaymentStatus = request.PaymentStatus;
            rental.DeliveryRequested = request.DeliveryRequested;
            rental.DeliveryAddress = request.DeliveryAddress;

            // Calculate new total price if dates changed
            var rentalDays = (request.EndDate - request.StartDate).Days;
            if (rentalDays <= 0) rentalDays = 1; // Minimum 1 day

            decimal basePrice = 0;
            if (rental.Item.PricePerDay.HasValue)
            {
                basePrice = rental.Item.PricePerDay.Value * rentalDays;
            }
            else if (rental.Item.PricePerHour.HasValue)
            {
                var rentalHours = (request.EndDate - request.StartDate).TotalHours;
                basePrice = rental.Item.PricePerHour.Value * (decimal)rentalHours;
            }

            rental.TotalPrice = basePrice + (rental.DeliveryFee ?? 0) + rental.PlatformFee;

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // Return updated rental
            var updatedRental = new RentalDto
            {
                Id = rental.Id,
                StartDate = rental.StartDate,
                EndDate = rental.EndDate,
                TotalPrice = rental.TotalPrice,
                DepositPaid = rental.DepositPaid,
                PlatformFee = rental.PlatformFee,
                Status = rental.Status,
                PaymentStatus = rental.PaymentStatus,
                PaymentMethod = rental.PaymentMethod,
                StripePaymentIntentId = rental.StripePaymentIntentId,
                PaypalOrderId = rental.PaypalOrderId,
                DeliveryRequested = rental.DeliveryRequested,
                DeliveryAddress = rental.DeliveryAddress,
                DeliveryFee = rental.DeliveryFee,
                ItemId = rental.ItemId,
                OwnerId = rental.OwnerId,
                RenterId = rental.RenterId,
                ItemTitle = rental.Item.Title,
                OwnerName = rental.Owner.Name,
                RenterName = rental.Renter.Name,
                ItemImageUrl = rental.Item.Images.FirstOrDefault()?.Url,
                CreatedAt = rental.CreatedAt,
                UpdatedAt = rental.UpdatedAt,
                CreatedBy = rental.CreatedBy,
                UpdatedBy = rental.UpdatedBy
            };

            return Result.Success<RentalDto?>(updatedRental);
        }
        catch (Exception ex)
        {
            return Result.Failure<RentalDto?>($"Error updating rental: {ex.Message}");
        }
    }
}