using Dorfkiste.Core.Entities;

namespace Dorfkiste.Core.Interfaces;

public interface IReportRepository
{
    Task<IEnumerable<Report>> GetAllAsync();
    Task<Report?> GetByIdAsync(int id);
    Task<IEnumerable<Report>> GetByReporterIdAsync(int reporterId);
    Task<IEnumerable<Report>> GetByStatusAsync(ReportStatus status);
    Task<IEnumerable<Report>> GetPendingReportsAsync();
    Task<IEnumerable<Report>> GetReportsByOfferIdAsync(int offerId);
    Task<IEnumerable<Report>> GetReportsByUserIdAsync(int userId);
    Task<Report> CreateAsync(Report report);
    Task<Report> UpdateAsync(Report report);
    Task DeleteAsync(int id);
}
