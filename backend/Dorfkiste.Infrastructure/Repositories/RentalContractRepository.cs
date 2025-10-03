using Dorfkiste.Core.Entities;
using Dorfkiste.Core.Interfaces;
using Dorfkiste.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Dorfkiste.Infrastructure.Repositories;

public class RentalContractRepository : IRentalContractRepository
{
    private readonly DorfkisteDbContext _context;
    private readonly ILogger<RentalContractRepository> _logger;

    public RentalContractRepository(DorfkisteDbContext context, ILogger<RentalContractRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<RentalContract?> GetByIdAsync(int id)
    {
        return await _context.RentalContracts
            .Include(c => c.Booking)
                .ThenInclude(b => b.Offer)
            .Include(c => c.Lessor)
                .ThenInclude(l => l.ContactInfo)
            .Include(c => c.Lessee)
                .ThenInclude(l => l.ContactInfo)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<RentalContract?> GetByBookingIdAsync(int bookingId)
    {
        return await _context.RentalContracts
            .Include(c => c.Booking)
                .ThenInclude(b => b.Offer)
            .Include(c => c.Lessor)
                .ThenInclude(l => l.ContactInfo)
            .Include(c => c.Lessee)
                .ThenInclude(l => l.ContactInfo)
            .FirstOrDefaultAsync(c => c.BookingId == bookingId);
    }

    public async Task<List<RentalContract>> GetContractsByUserIdAsync(int userId)
    {
        return await _context.RentalContracts
            .Include(c => c.Booking)
                .ThenInclude(b => b.Offer)
            .Include(c => c.Lessor)
            .Include(c => c.Lessee)
            .Where(c => c.LessorId == userId || c.LesseeId == userId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<RentalContract>> GetContractsByLessorIdAsync(int lessorId)
    {
        return await _context.RentalContracts
            .Include(c => c.Booking)
                .ThenInclude(b => b.Offer)
            .Include(c => c.Lessee)
            .Where(c => c.LessorId == lessorId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<RentalContract>> GetContractsByLesseeIdAsync(int lesseeId)
    {
        return await _context.RentalContracts
            .Include(c => c.Booking)
                .ThenInclude(b => b.Offer)
            .Include(c => c.Lessor)
            .Where(c => c.LesseeId == lesseeId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<RentalContract> CreateAsync(RentalContract contract)
    {
        _context.RentalContracts.Add(contract);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Created rental contract {ContractId} for booking {BookingId}", contract.Id, contract.BookingId);
        return contract;
    }

    public async Task<RentalContract> UpdateAsync(RentalContract contract)
    {
        contract.LastModifiedAt = DateTime.UtcNow;
        _context.RentalContracts.Update(contract);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Updated rental contract {ContractId}", contract.Id);
        return contract;
    }

    public async Task DeleteAsync(int id)
    {
        var contract = await _context.RentalContracts.FindAsync(id);
        if (contract != null)
        {
            _context.RentalContracts.Remove(contract);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Deleted rental contract {ContractId}", id);
        }
    }
}
