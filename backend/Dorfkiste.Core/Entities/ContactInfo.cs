namespace Dorfkiste.Core.Entities;

public class ContactInfo
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string? PhoneNumber { get; set; }
    public string? MobileNumber { get; set; }
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? PostalCode { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    
    public User User { get; set; } = null!;
}