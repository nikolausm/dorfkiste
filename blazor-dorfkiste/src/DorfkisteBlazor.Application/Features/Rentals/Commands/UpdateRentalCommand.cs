using DorfkisteBlazor.Application.Common.Interfaces;
using DorfkisteBlazor.Application.Common.Models;
using DorfkisteBlazor.Application.Features.Rentals.DTOs;

namespace DorfkisteBlazor.Application.Features.Rentals.Commands;

/// <summary>
/// Command to update an existing rental
/// </summary>
public class UpdateRentalCommand : ICommand<Result<RentalDto?>>
{
    public Guid Id { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = "pending";
    public string PaymentStatus { get; set; } = "pending";
    public bool DeliveryRequested { get; set; } = false;
    public string? DeliveryAddress { get; set; }
}