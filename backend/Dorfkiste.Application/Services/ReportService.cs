using Dorfkiste.Core.Entities;
using Dorfkiste.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace Dorfkiste.Application.Services;

public class ReportService : IReportService
{
    private readonly IReportRepository _reportRepository;
    private readonly IOfferRepository _offerRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<ReportService> _logger;

    public ReportService(
        IReportRepository reportRepository,
        IOfferRepository offerRepository,
        IUserRepository userRepository,
        ILogger<ReportService> logger)
    {
        _reportRepository = reportRepository;
        _offerRepository = offerRepository;
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<Report> SubmitReportAsync(
        int reporterId,
        ReportType reportType,
        string description,
        int? reportedOfferId = null,
        int? reportedUserId = null,
        int? reportedMessageId = null)
    {
        // Validate that at least one target is specified
        if (!reportedOfferId.HasValue && !reportedUserId.HasValue && !reportedMessageId.HasValue)
        {
            throw new ArgumentException("At least one target (offer, user, or message) must be specified for the report.");
        }

        // Validate reporter exists
        var reporter = await _userRepository.GetByIdAsync(reporterId);
        if (reporter == null)
        {
            throw new ArgumentException("Reporter user not found.");
        }

        // Validate reported entity exists (if applicable)
        if (reportedOfferId.HasValue)
        {
            var offer = await _offerRepository.GetByIdAsync(reportedOfferId.Value);
            if (offer == null)
            {
                throw new ArgumentException("Reported offer not found.");
            }
        }

        if (reportedUserId.HasValue)
        {
            var reportedUser = await _userRepository.GetByIdAsync(reportedUserId.Value);
            if (reportedUser == null)
            {
                throw new ArgumentException("Reported user not found.");
            }
        }

        var report = new Report
        {
            ReporterId = reporterId,
            ReportType = reportType,
            Description = description,
            ReportedOfferId = reportedOfferId,
            ReportedUserId = reportedUserId,
            ReportedMessageId = reportedMessageId,
            Status = ReportStatus.Pending
        };

        var createdReport = await _reportRepository.CreateAsync(report);
        _logger.LogInformation("Report {ReportId} submitted by user {ReporterId} for {ReportType}",
            createdReport.Id, reporterId, reportType);

        return createdReport;
    }

    public async Task<IEnumerable<Report>> GetUserReportsAsync(int userId)
    {
        return await _reportRepository.GetByReporterIdAsync(userId);
    }

    public async Task<Report?> GetReportByIdAsync(int reportId)
    {
        return await _reportRepository.GetByIdAsync(reportId);
    }

    public async Task<IEnumerable<Report>> GetAllReportsAsync()
    {
        return await _reportRepository.GetAllAsync();
    }

    public async Task<IEnumerable<Report>> GetPendingReportsAsync()
    {
        return await _reportRepository.GetPendingReportsAsync();
    }

    public async Task<Report> ReviewReportAsync(
        int reportId,
        int adminId,
        ReportStatus newStatus,
        string? resolutionNotes = null)
    {
        var report = await _reportRepository.GetByIdAsync(reportId);
        if (report == null)
        {
            throw new ArgumentException("Report not found.");
        }

        // Validate admin user exists
        var admin = await _userRepository.GetByIdAsync(adminId);
        if (admin == null || !admin.IsAdmin)
        {
            throw new UnauthorizedAccessException("Only administrators can review reports.");
        }

        report.Status = newStatus;
        report.ReviewedById = adminId;
        report.ReviewedAt = DateTime.UtcNow;
        report.ResolutionNotes = resolutionNotes;

        var updatedReport = await _reportRepository.UpdateAsync(report);
        _logger.LogInformation("Report {ReportId} reviewed by admin {AdminId} with status {Status}",
            reportId, adminId, newStatus);

        return updatedReport;
    }

    public async Task RemoveReportedOfferAsync(int offerId, int adminId)
    {
        var admin = await _userRepository.GetByIdAsync(adminId);
        if (admin == null || !admin.IsAdmin)
        {
            throw new UnauthorizedAccessException("Only administrators can remove offers.");
        }

        var offer = await _offerRepository.GetByIdAsync(offerId);
        if (offer == null)
        {
            throw new ArgumentException("Offer not found.");
        }

        // Mark offer as inactive instead of deleting
        offer.IsActive = false;
        offer.UpdatedAt = DateTime.UtcNow;
        await _offerRepository.UpdateAsync(offer);

        _logger.LogInformation("Offer {OfferId} removed by admin {AdminId}", offerId, adminId);
    }

    public async Task SuspendUserAsync(int userId, int adminId, DateTime? suspensionEndDate = null)
    {
        var admin = await _userRepository.GetByIdAsync(adminId);
        if (admin == null || !admin.IsAdmin)
        {
            throw new UnauthorizedAccessException("Only administrators can suspend users.");
        }

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new ArgumentException("User not found.");
        }

        // Mark user as inactive
        user.IsActive = false;
        await _userRepository.UpdateAsync(user);

        _logger.LogInformation("User {UserId} suspended by admin {AdminId}", userId, adminId);
    }
}
