namespace DorfkisteBlazor.Application.Features.Items.DTOs;

/// <summary>
/// Response object for paginated item results
/// </summary>
public class ItemsResponse
{
    public IEnumerable<ItemDto> Items { get; set; } = new List<ItemDto>();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}