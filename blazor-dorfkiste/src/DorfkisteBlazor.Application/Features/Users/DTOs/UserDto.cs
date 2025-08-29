namespace DorfkisteBlazor.Application.Features.Users.DTOs;

/// <summary>
/// Data transfer object for user information
/// </summary>
public class UserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public bool Verified { get; set; }
    public bool IsAdmin { get; set; }
    public string? StripeCustomerId { get; set; }
    public string? PaypalEmail { get; set; }
    
    // Audit fields
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}