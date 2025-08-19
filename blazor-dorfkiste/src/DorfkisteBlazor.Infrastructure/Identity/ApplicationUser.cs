using Microsoft.AspNetCore.Identity;

namespace DorfkisteBlazor.Infrastructure.Identity;

/// <summary>
/// Application user entity extending ASP.NET Core Identity
/// </summary>
public class ApplicationUser : IdentityUser
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? DisplayName { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }
    
    // Navigation properties will be added here
    // Example: public virtual ICollection<Order> Orders { get; set; } = new HashSet<Order>();
}