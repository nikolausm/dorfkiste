using DorfkisteBlazor.Domain.Common;

namespace DorfkisteBlazor.Domain.Entities;

/// <summary>
/// User entity representing registered users in the system
/// </summary>
public class User : BaseEntity, IAuditableEntity
{
    public required string Email { get; set; }
    public string? Password { get; set; }
    public string? Name { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public bool Verified { get; set; } = false;
    public bool IsAdmin { get; set; } = false;
    public string? StripeCustomerId { get; set; }
    public string? PaypalEmail { get; set; }

    // Navigation properties
    public virtual ICollection<Item> Items { get; set; } = new List<Item>();
    public virtual ICollection<Rental> RentalsAsOwner { get; set; } = new List<Rental>();
    public virtual ICollection<Rental> RentalsAsRenter { get; set; } = new List<Rental>();
    public virtual ICollection<Review> ReviewsGiven { get; set; } = new List<Review>();
    public virtual ICollection<Review> ReviewsReceived { get; set; } = new List<Review>();
    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public virtual ICollection<Payout> Payouts { get; set; } = new List<Payout>();
    public virtual ICollection<WatchlistItem> WatchlistItems { get; set; } = new List<WatchlistItem>();
    public virtual ICollection<PasswordResetToken> PasswordResetTokens { get; set; } = new List<PasswordResetToken>();
}