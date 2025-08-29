namespace DorfkisteBlazor.Application.Features.Users.DTOs;

/// <summary>
/// Data transfer object for updating user profile
/// </summary>
public class UpdateUserProfileDto
{
    public string? Name { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public string? PaypalEmail { get; set; }
}