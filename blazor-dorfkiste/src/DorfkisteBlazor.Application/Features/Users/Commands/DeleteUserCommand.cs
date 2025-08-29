using DorfkisteBlazor.Application.Common.Interfaces;
using DorfkisteBlazor.Application.Common.Models;

namespace DorfkisteBlazor.Application.Features.Users.Commands;

/// <summary>
/// Command to delete a user (admin only)
/// </summary>
public class DeleteUserCommand : ICommand<Result<bool>>
{
    public Guid UserId { get; set; }
    public Guid RequestingUserId { get; set; }
}