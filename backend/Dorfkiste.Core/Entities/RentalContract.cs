namespace Dorfkiste.Core.Entities;

public class RentalContract
{
    public int Id { get; set; }

    // Relationships
    public int BookingId { get; set; }
    public Booking Booking { get; set; } = null!;

    public int LessorId { get; set; } // Provider/Owner
    public User Lessor { get; set; } = null!;

    public int LesseeId { get; set; } // Customer/Renter
    public User Lessee { get; set; } = null!;

    // Offer details (snapshot at contract creation)
    public string OfferTitle { get; set; } = string.Empty;
    public string OfferDescription { get; set; } = string.Empty;
    public string OfferType { get; set; } = string.Empty; // Item or Service

    // Rental period
    public DateOnly RentalStartDate { get; set; }
    public DateOnly RentalEndDate { get; set; }
    public int RentalDays { get; set; }

    // Financial details
    public decimal TotalPrice { get; set; }
    public decimal DepositAmount { get; set; }
    public decimal PricePerDay { get; set; }

    // Terms and conditions
    public string TermsAndConditions { get; set; } = string.Empty;
    public string SpecialConditions { get; set; } = string.Empty;

    // Digital signatures
    public DateTime CreatedAt { get; set; }
    public DateTime? SignedByLessorAt { get; set; }
    public DateTime? SignedByLesseeAt { get; set; }

    // Contract status
    public ContractStatus Status { get; set; } = ContractStatus.Draft;

    // Audit trail
    public DateTime? LastModifiedAt { get; set; }
    public string? CancellationReason { get; set; }
    public DateTime? CancelledAt { get; set; }
}

public enum ContractStatus
{
    Draft = 0,
    SignedByLessor = 1,
    SignedByBoth = 2,
    Active = 3,
    Completed = 4,
    Cancelled = 5
}
