using Microsoft.EntityFrameworkCore;
using Dorfkiste.Core.Entities;
using Dorfkiste.Core.Interfaces;
using Dorfkiste.Infrastructure.Data;

namespace Dorfkiste.Infrastructure.Repositories;

public class ReportRepository : IReportRepository
{
    private readonly DorfkisteDbContext _context;

    public ReportRepository(DorfkisteDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Report>> GetAllAsync()
    {
        return await _context.Reports
            .Include(r => r.Reporter)
            .Include(r => r.ReportedOffer)
            .Include(r => r.ReportedUser)
            .Include(r => r.ReportedMessage)
            .Include(r => r.ReviewedBy)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<Report?> GetByIdAsync(int id)
    {
        return await _context.Reports
            .Include(r => r.Reporter)
            .Include(r => r.ReportedOffer)
                .ThenInclude(o => o!.User)
            .Include(r => r.ReportedOffer)
                .ThenInclude(o => o!.Pictures)
            .Include(r => r.ReportedUser)
            .Include(r => r.ReportedMessage)
            .Include(r => r.ReviewedBy)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<IEnumerable<Report>> GetByReporterIdAsync(int reporterId)
    {
        return await _context.Reports
            .Include(r => r.ReportedOffer)
            .Include(r => r.ReportedUser)
            .Include(r => r.ReportedMessage)
            .Where(r => r.ReporterId == reporterId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Report>> GetByStatusAsync(ReportStatus status)
    {
        return await _context.Reports
            .Include(r => r.Reporter)
            .Include(r => r.ReportedOffer)
            .Include(r => r.ReportedUser)
            .Include(r => r.ReportedMessage)
            .Include(r => r.ReviewedBy)
            .Where(r => r.Status == status)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Report>> GetPendingReportsAsync()
    {
        return await GetByStatusAsync(ReportStatus.Pending);
    }

    public async Task<IEnumerable<Report>> GetReportsByOfferIdAsync(int offerId)
    {
        return await _context.Reports
            .Include(r => r.Reporter)
            .Include(r => r.ReviewedBy)
            .Where(r => r.ReportedOfferId == offerId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Report>> GetReportsByUserIdAsync(int userId)
    {
        return await _context.Reports
            .Include(r => r.Reporter)
            .Include(r => r.ReviewedBy)
            .Where(r => r.ReportedUserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<Report> CreateAsync(Report report)
    {
        report.CreatedAt = DateTime.UtcNow;
        _context.Reports.Add(report);
        await _context.SaveChangesAsync();
        return report;
    }

    public async Task<Report> UpdateAsync(Report report)
    {
        _context.Reports.Update(report);
        await _context.SaveChangesAsync();
        return report;
    }

    public async Task DeleteAsync(int id)
    {
        var report = await _context.Reports.FindAsync(id);
        if (report != null)
        {
            _context.Reports.Remove(report);
            await _context.SaveChangesAsync();
        }
    }
}
