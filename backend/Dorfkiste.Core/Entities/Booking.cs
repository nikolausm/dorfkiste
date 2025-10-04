namespace Dorfkiste.Core.Entities;

public class Booking
{
    public int Id { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public decimal TotalPrice { get; set; }
    public int DaysCount { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Confirmed;
    public DateTime CreatedAt { get; set; }
    public DateTime? ConfirmedAt { get; set; }

    // Legal compliance
    public bool TermsAccepted { get; set; }
    public DateTime? TermsAcceptedAt { get; set; }
    public bool WithdrawalRightAcknowledged { get; set; }
    public DateTime? WithdrawalRightAcknowledgedAt { get; set; }

    // Foreign Keys
    public int OfferId { get; set; }
    public Offer Offer { get; set; } = null!;

    public int CustomerId { get; set; }
    public User Customer { get; set; } = null!;
}

public enum BookingStatus
{
    Confirmed = 0,
    Completed = 1,
    Cancelled = 2
}