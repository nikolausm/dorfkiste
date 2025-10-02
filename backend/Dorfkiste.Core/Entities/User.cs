namespace Dorfkiste.Core.Entities;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public bool IsActive { get; set; } = true;
    
    public ContactInfo ContactInfo { get; set; } = new();
    public ICollection<Offer> Offers { get; set; } = new List<Offer>();
    public ICollection<Booking> CustomerBookings { get; set; } = new List<Booking>();
}