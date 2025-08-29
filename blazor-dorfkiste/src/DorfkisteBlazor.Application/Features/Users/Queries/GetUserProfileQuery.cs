using DorfkisteBlazor.Application.Common.Interfaces;
using DorfkisteBlazor.Application.Common.Models;
using DorfkisteBlazor.Application.Features.Users.DTOs;

namespace DorfkisteBlazor.Application.Features.Users.Queries;

/// <summary>
/// Query to get a user's profile by ID
/// </summary>
public class GetUserProfileQuery : IQuery<Result<UserProfileDto?>>
{
    public Guid UserId { get; set; }
}