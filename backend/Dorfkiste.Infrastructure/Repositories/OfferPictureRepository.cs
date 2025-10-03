using Microsoft.EntityFrameworkCore;
using Dorfkiste.Core.Entities;
using Dorfkiste.Core.Interfaces;
using Dorfkiste.Infrastructure.Data;

namespace Dorfkiste.Infrastructure.Repositories;

public class OfferPictureRepository : IOfferPictureRepository
{
    private readonly DorfkisteDbContext _context;

    public OfferPictureRepository(DorfkisteDbContext context)
    {
        _context = context;
    }

    public async Task<OfferPicture> CreateAsync(OfferPicture picture)
    {
        _context.OfferPictures.Add(picture);
        await _context.SaveChangesAsync();
        return picture;
    }

    public async Task<OfferPicture?> GetByIdAsync(int id)
    {
        return await _context.OfferPictures
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<IEnumerable<OfferPicture>> GetByOfferIdAsync(int offerId)
    {
        return await _context.OfferPictures
            .Where(p => p.OfferId == offerId)
            .OrderBy(p => p.DisplayOrder)
            .ToListAsync();
    }

    public async Task<OfferPicture> UpdateAsync(OfferPicture picture)
    {
        _context.OfferPictures.Update(picture);
        await _context.SaveChangesAsync();
        return picture;
    }

    public async Task DeleteAsync(int id)
    {
        var picture = await GetByIdAsync(id);
        if (picture != null)
        {
            _context.OfferPictures.Remove(picture);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<int> GetMaxDisplayOrderForOfferAsync(int offerId)
    {
        var maxOrder = await _context.OfferPictures
            .Where(p => p.OfferId == offerId)
            .MaxAsync(p => (int?)p.DisplayOrder);
        
        return maxOrder ?? 0;
    }
}