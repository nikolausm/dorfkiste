using DorfkisteBlazor.Application.Common.Interfaces;
using DorfkisteBlazor.Application.Common.Models;
using DorfkisteBlazor.Application.Features.Items.DTOs;
using DorfkisteBlazor.Domain.Entities;

namespace DorfkisteBlazor.Application.Features.Items.Queries;

/// <summary>
/// Query to get items with filtering and pagination
/// </summary>
public class GetItemsQuery : IQuery<Result<ItemsResponse>>
{
    public string? SearchTerm { get; set; }
    public Guid? CategoryId { get; set; }
    public string? Location { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public string? Condition { get; set; }
    public bool? DeliveryAvailable { get; set; }
    public bool AvailableOnly { get; set; } = true;
    public string SortBy { get; set; } = "CreatedAt";
    public string SortDirection { get; set; } = "desc";
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

