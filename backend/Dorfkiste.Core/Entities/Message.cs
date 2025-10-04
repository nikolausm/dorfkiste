namespace Dorfkiste.Core.Entities;

public class Message
{
    public int Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime SentAt { get; set; }
    public bool IsRead { get; set; } = false;
    
    // Sender information
    public int SenderId { get; set; }
    public User Sender { get; set; } = null!;
    
    // Recipient information
    public int RecipientId { get; set; }
    public User Recipient { get; set; } = null!;
    
    // Related offer (optional - not required for direct admin messages)
    public int? OfferId { get; set; }
    public Offer? Offer { get; set; }
}