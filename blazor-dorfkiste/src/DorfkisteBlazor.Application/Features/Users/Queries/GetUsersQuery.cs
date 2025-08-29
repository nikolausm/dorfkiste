using DorfkisteBlazor.Application.Common.Interfaces;
using DorfkisteBlazor.Application.Common.Models;
using DorfkisteBlazor.Application.Features.Users.DTOs;

namespace DorfkisteBlazor.Application.Features.Users.Queries;

/// <summary>
/// Query to get paginated list of users
/// </summary>
public class GetUsersQuery : IQuery<Result<UsersResponse>>
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SearchTerm { get; set; }
    public bool? Verified { get; set; }
    public bool? IsAdmin { get; set; }
    public string? SortBy { get; set; } = "CreatedAt";
    public string? SortDirection { get; set; } = "desc";
}