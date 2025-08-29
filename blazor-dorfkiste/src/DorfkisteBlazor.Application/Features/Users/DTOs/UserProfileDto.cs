namespace DorfkisteBlazor.Application.Features.Users.DTOs;

/// <summary>
/// Data transfer object for detailed user profile information
/// </summary>
public class UserProfileDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public bool Verified { get; set; }
    public string? PaypalEmail { get; set; }
    
    // Statistics
    public int TotalItems { get; set; }
    public int ActiveRentals { get; set; }
    public int CompletedRentals { get; set; }
    public double AverageRating { get; set; }
    public int TotalReviews { get; set; }
    
    // Audit fields
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}