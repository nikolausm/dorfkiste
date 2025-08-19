using DorfkisteBlazor.Application.Common.Interfaces;
using DorfkisteBlazor.Application.Common.Models;
using DorfkisteBlazor.Application.Features.Rentals.DTOs;

namespace DorfkisteBlazor.Application.Features.Rentals.Commands;

/// <summary>
/// Command to create a new rental booking
/// </summary>
public class CreateRentalCommand : ICommand<Result<CreateRentalResponse>>
{
    public Guid ItemId { get; set; }
    public Guid RenterId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool DeliveryRequested { get; set; }
    public string? DeliveryAddress { get; set; }
    public string PaymentMethod { get; set; } = "stripe"; // stripe or paypal
}

