using Dorfkiste.Core.Entities;

namespace Dorfkiste.Core.Interfaces;

public interface IReportService
{
    Task<Report> SubmitReportAsync(int reporterId, ReportType reportType, string description,
        int? reportedOfferId = null, int? reportedUserId = null, int? reportedMessageId = null);
    Task<IEnumerable<Report>> GetUserReportsAsync(int userId);
    Task<Report?> GetReportByIdAsync(int reportId);
    Task<IEnumerable<Report>> GetAllReportsAsync();
    Task<IEnumerable<Report>> GetPendingReportsAsync();
    Task<Report> ReviewReportAsync(int reportId, int adminId, ReportStatus newStatus, string? resolutionNotes = null);
    Task RemoveReportedOfferAsync(int offerId, int adminId);
    Task SuspendUserAsync(int userId, int adminId, DateTime? suspensionEndDate = null);
}
