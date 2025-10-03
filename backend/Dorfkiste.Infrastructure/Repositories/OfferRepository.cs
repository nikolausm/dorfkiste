using Microsoft.EntityFrameworkCore;
using Dorfkiste.Core.Entities;
using Dorfkiste.Core.Interfaces;
using Dorfkiste.Infrastructure.Data;

namespace Dorfkiste.Infrastructure.Repositories;

public class OfferRepository : IOfferRepository
{
    private readonly DorfkisteDbContext _context;

    public OfferRepository(DorfkisteDbContext context)
    {
        _context = context;
    }

    public async Task<Offer?> GetByIdAsync(int id)
    {
        return await _context.Offers
            .Include(o => o.User)
                .ThenInclude(u => u.ContactInfo)
            .Include(o => o.Category)
            .Include(o => o.Pictures)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task<IEnumerable<Offer>> GetAllAsync()
    {
        return await _context.Offers
            .Include(o => o.User)
            .Include(o => o.Category)
            .Include(o => o.Pictures)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Offer>> GetByCategoryAsync(int categoryId)
    {
        return await _context.Offers
            .Include(o => o.User)
            .Include(o => o.Category)
            .Include(o => o.Pictures)
            .Where(o => o.CategoryId == categoryId && o.IsActive)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Offer>> GetByUserAsync(int userId)
    {
        return await _context.Offers
            .Include(o => o.Category)
            .Include(o => o.Pictures)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Offer>> SearchAsync(string searchTerm)
    {
        var lowerSearchTerm = searchTerm.ToLower();
        
        return await _context.Offers
            .Include(o => o.User)
            .Include(o => o.Category)
            .Include(o => o.Pictures)
            .Where(o => o.IsActive && 
                       (o.Title.ToLower().Contains(lowerSearchTerm) ||
                        o.Description.ToLower().Contains(lowerSearchTerm) ||
                        o.Category.Name.ToLower().Contains(lowerSearchTerm)))
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<Offer> CreateAsync(Offer offer)
    {
        offer.CreatedAt = DateTime.UtcNow;
        offer.UpdatedAt = DateTime.UtcNow;
        
        _context.Offers.Add(offer);
        await _context.SaveChangesAsync();
        return offer;
    }

    public async Task<Offer> UpdateAsync(Offer offer)
    {
        offer.UpdatedAt = DateTime.UtcNow;
        
        _context.Offers.Update(offer);
        await _context.SaveChangesAsync();
        return offer;
    }

    public async Task DeleteAsync(int id)
    {
        var offer = await _context.Offers.FindAsync(id);
        if (offer != null)
        {
            _context.Offers.Remove(offer);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<Offer>> GetActiveAsync()
    {
        return await _context.Offers
            .Include(o => o.User)
            .Include(o => o.Category)
            .Include(o => o.Pictures)
            .Where(o => o.IsActive)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Offer>> GetByUserIdAsync(int userId)
    {
        return await _context.Offers
            .Include(o => o.User)
            .Include(o => o.Category)
            .Include(o => o.Pictures)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }
}