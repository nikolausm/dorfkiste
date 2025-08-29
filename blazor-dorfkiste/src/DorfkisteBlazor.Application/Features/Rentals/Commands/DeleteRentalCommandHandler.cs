using DorfkisteBlazor.Application.Common.Interfaces;
using DorfkisteBlazor.Application.Common.Models;
using DorfkisteBlazor.Domain.Interfaces;
using DorfkisteBlazor.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DorfkisteBlazor.Application.Features.Rentals.Commands;

/// <summary>
/// Handler for DeleteRentalCommand
/// </summary>
public class DeleteRentalCommandHandler : ICommandHandler<DeleteRentalCommand, Result>
{
    private readonly IRepository<Rental> _rentalRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteRentalCommandHandler(
        IRepository<Rental> rentalRepository,
        IUnitOfWork unitOfWork)
    {
        _rentalRepository = rentalRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteRentalCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var rental = await _rentalRepository.GetByIdAsync(request.Id, cancellationToken);
            
            if (rental == null)
            {
                return Result.Failure("Rental not found");
            }

            // Validate that rental can be deleted
            if (rental.Status == "active" || rental.Status == "completed")
            {
                return Result.Failure("Cannot delete an active or completed rental");
            }

            if (rental.PaymentStatus == "paid")
            {
                return Result.Failure("Cannot delete a rental with paid payment. Please refund first.");
            }

            // Soft delete the rental
            await _rentalRepository.RemoveAsync(rental, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure($"Error deleting rental: {ex.Message}");
        }
    }
}