namespace DorfkisteBlazor.Application.Features.Rentals.DTOs;

/// <summary>
/// Response model for paginated rental results
/// </summary>
public class RentalsResponse
{
    public IEnumerable<RentalDto> Rentals { get; set; } = new List<RentalDto>();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool HasNextPage => Page < TotalPages;
    public bool HasPreviousPage => Page > 1;
}