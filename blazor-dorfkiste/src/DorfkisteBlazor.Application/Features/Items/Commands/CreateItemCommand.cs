using DorfkisteBlazor.Application.Common.Interfaces;
using DorfkisteBlazor.Application.Common.Models;
using DorfkisteBlazor.Application.Features.Items.DTOs;

namespace DorfkisteBlazor.Application.Features.Items.Commands;

/// <summary>
/// Command to create a new item for rental
/// </summary>
public class CreateItemCommand : ICommand<Result<CreateItemResponse>>
{
    public required string Title { get; set; }
    public string? Description { get; set; }
    public required string Condition { get; set; }
    public decimal? PricePerDay { get; set; }
    public decimal? PricePerHour { get; set; }
    public decimal? Deposit { get; set; }
    public required string Location { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public bool DeliveryAvailable { get; set; }
    public decimal? DeliveryFee { get; set; }
    public double? DeliveryRadius { get; set; }
    public string? DeliveryDetails { get; set; }
    public bool PickupAvailable { get; set; } = true;
    public Guid CategoryId { get; set; }
    public Guid UserId { get; set; } // Set by the controller from the authenticated user
    public List<string> ImageUrls { get; set; } = new();
}