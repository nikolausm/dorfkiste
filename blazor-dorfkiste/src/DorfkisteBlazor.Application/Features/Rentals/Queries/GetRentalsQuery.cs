using DorfkisteBlazor.Application.Common.Interfaces;
using DorfkisteBlazor.Application.Common.Models;
using DorfkisteBlazor.Application.Features.Rentals.DTOs;

namespace DorfkisteBlazor.Application.Features.Rentals.Queries;

/// <summary>
/// Query to get rentals with filtering and pagination
/// </summary>
public class GetRentalsQuery : IQuery<Result<RentalsResponse>>
{
    public Guid? ItemId { get; set; }
    public Guid? OwnerId { get; set; }
    public Guid? RenterId { get; set; }
    public string? Status { get; set; }
    public string? PaymentStatus { get; set; }
    public DateTime? StartDateFrom { get; set; }
    public DateTime? StartDateTo { get; set; }
    public DateTime? EndDateFrom { get; set; }
    public DateTime? EndDateTo { get; set; }
    public bool? DeliveryRequested { get; set; }
    public string SortBy { get; set; } = "CreatedAt";
    public string SortDirection { get; set; } = "desc";
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}