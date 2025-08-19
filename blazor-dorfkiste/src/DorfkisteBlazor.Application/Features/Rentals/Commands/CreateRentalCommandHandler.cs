using DorfkisteBlazor.Application.Common.Interfaces;
using DorfkisteBlazor.Application.Common.Models;
using DorfkisteBlazor.Application.Features.Rentals.DTOs;
using DorfkisteBlazor.Domain.Interfaces;
using DorfkisteBlazor.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DorfkisteBlazor.Application.Features.Rentals.Commands;

/// <summary>
/// Handler for CreateRentalCommand with booking logic and payment processing
/// </summary>
public class CreateRentalCommandHandler : ICommandHandler<CreateRentalCommand, Result<CreateRentalResponse>>
{
    private readonly IRepository<Rental> _rentalRepository;
    private readonly IRepository<Item> _itemRepository;
    private readonly IRepository<PlatformSettings> _settingsRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateRentalCommandHandler(
        IRepository<Rental> rentalRepository,
        IRepository<Item> itemRepository,
        IRepository<PlatformSettings> settingsRepository,
        IUnitOfWork unitOfWork)
    {
        _rentalRepository = rentalRepository;
        _itemRepository = itemRepository;
        _settingsRepository = settingsRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CreateRentalResponse>> Handle(CreateRentalCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Validate the item exists and is available
            var item = await _itemRepository.GetQueryable()
                .Include(i => i.User)
                .FirstOrDefaultAsync(i => i.Id == request.ItemId, cancellationToken);

            if (item == null)
            {
                return Result.Failure<CreateRentalResponse>("Item not found");
            }

            if (!item.Available)
            {
                return Result.Failure<CreateRentalResponse>("Item is not available for rental");
            }

            if (item.UserId == request.RenterId)
            {
                return Result.Failure<CreateRentalResponse>("You cannot rent your own item");
            }

            // Check for conflicting rentals
            var conflictingRental = await _rentalRepository.GetQueryable()
                .Where(r => r.ItemId == request.ItemId)
                .Where(r => r.Status != "cancelled" && r.Status != "completed")
                .Where(r => request.StartDate < r.EndDate && request.EndDate > r.StartDate)
                .FirstOrDefaultAsync(cancellationToken);

            if (conflictingRental != null)
            {
                return Result.Failure<CreateRentalResponse>("Item is already booked for the selected dates");
            }

            // Validate delivery options
            if (request.DeliveryRequested && !item.DeliveryAvailable)
            {
                return Result.Failure<CreateRentalResponse>("Delivery is not available for this item");
            }

            if (request.DeliveryRequested && string.IsNullOrWhiteSpace(request.DeliveryAddress))
            {
                return Result.Failure<CreateRentalResponse>("Delivery address is required when requesting delivery");
            }

            // Get platform settings for fee calculation
            var settings = await _settingsRepository.GetQueryable().FirstOrDefaultAsync(cancellationToken);
            var platformFeePercentage = settings?.PlatformFeePercentage ?? 10;

            // Calculate pricing
            var rentalDays = (request.EndDate - request.StartDate).Days;
            if (rentalDays <= 0)
            {
                return Result.Failure<CreateRentalResponse>("End date must be after start date");
            }

            var basePrice = item.PricePerDay * rentalDays ?? 0;
            var deliveryFee = request.DeliveryRequested ? (item.DeliveryFee ?? 0) : 0;
            var platformFee = (basePrice + deliveryFee) * (platformFeePercentage / 100);
            var totalPrice = basePrice + deliveryFee + platformFee;
            var depositRequired = item.Deposit ?? 0;

            // Create rental
            var rental = new Rental
            {
                ItemId = request.ItemId,
                OwnerId = item.UserId,
                RenterId = request.RenterId,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                TotalPrice = totalPrice,
                DepositPaid = depositRequired,
                PlatformFee = platformFee,
                Status = "pending",
                PaymentStatus = "pending",
                PaymentMethod = request.PaymentMethod,
                DeliveryRequested = request.DeliveryRequested,
                DeliveryAddress = request.DeliveryAddress,
                DeliveryFee = deliveryFee
            };

            await _rentalRepository.AddAsync(rental, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // TODO: Create payment intent/order based on payment method
            string? paymentIntentId = null;
            string? paypalOrderId = null;

            if (request.PaymentMethod == "stripe")
            {
                // TODO: Integrate with Stripe API
                // paymentIntentId = await _stripeService.CreatePaymentIntentAsync(totalPrice + depositRequired);
            }
            else if (request.PaymentMethod == "paypal")
            {
                // TODO: Integrate with PayPal API
                // paypalOrderId = await _paypalService.CreateOrderAsync(totalPrice + depositRequired);
            }

            // Update rental with payment IDs
            if (!string.IsNullOrEmpty(paymentIntentId))
            {
                rental.StripePaymentIntentId = paymentIntentId;
            }
            if (!string.IsNullOrEmpty(paypalOrderId))
            {
                rental.PaypalOrderId = paypalOrderId;
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var response = new CreateRentalResponse
            {
                RentalId = rental.Id,
                TotalPrice = totalPrice,
                DepositRequired = depositRequired,
                PlatformFee = platformFee,
                DeliveryFee = deliveryFee,
                Status = rental.Status,
                PaymentStatus = rental.PaymentStatus,
                PaymentIntentId = paymentIntentId,
                PaypalOrderId = paypalOrderId
            };

            return Result.Success(response);
        }
        catch (Exception ex)
        {
            return Result.Failure<CreateRentalResponse>($"Error creating rental: {ex.Message}");
        }
    }
}