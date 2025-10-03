namespace Dorfkiste.Core.Entities;

public class Report
{
    public int Id { get; set; }
    public ReportType ReportType { get; set; }
    public string Description { get; set; } = string.Empty;
    public ReportStatus Status { get; set; } = ReportStatus.Pending;
    public string? ResolutionNotes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }

    // Foreign Keys
    public int ReporterId { get; set; }
    public User Reporter { get; set; } = null!;

    public int? ReportedOfferId { get; set; }
    public Offer? ReportedOffer { get; set; }

    public int? ReportedUserId { get; set; }
    public User? ReportedUser { get; set; }

    public int? ReportedMessageId { get; set; }
    public Message? ReportedMessage { get; set; }

    public int? ReviewedById { get; set; }
    public User? ReviewedBy { get; set; }
}

public enum ReportType
{
    IllegalContent = 0,
    Copyright = 1,
    Spam = 2,
    Fraud = 3,
    Harassment = 4,
    FakeProfile = 5,
    Other = 6
}

public enum ReportStatus
{
    Pending = 0,
    UnderReview = 1,
    Resolved = 2,
    Rejected = 3
}
