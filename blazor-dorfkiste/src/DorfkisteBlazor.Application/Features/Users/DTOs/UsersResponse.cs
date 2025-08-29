namespace DorfkisteBlazor.Application.Features.Users.DTOs;

/// <summary>
/// Response object for paginated users listing
/// </summary>
public class UsersResponse
{
    public List<UserDto> Users { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasPreviousPage => Page > 1;
    public bool HasNextPage => Page < TotalPages;
}