using DorfkisteBlazor.Application.Common.Interfaces;
using DorfkisteBlazor.Application.Common.Models;
using DorfkisteBlazor.Application.Features.Users.DTOs;

namespace DorfkisteBlazor.Application.Features.Users.Commands;

/// <summary>
/// Command to update user profile
/// </summary>
public class UpdateUserProfileCommand : ICommand<Result<UserProfileDto>>
{
    public Guid UserId { get; set; }
    public string? Name { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public string? PaypalEmail { get; set; }
}