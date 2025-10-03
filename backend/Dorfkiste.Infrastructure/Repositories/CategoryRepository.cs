using Microsoft.EntityFrameworkCore;
using Dorfkiste.Core.Entities;
using Dorfkiste.Core.Interfaces;
using Dorfkiste.Infrastructure.Data;

namespace Dorfkiste.Infrastructure.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly DorfkisteDbContext _context;

    public CategoryRepository(DorfkisteDbContext context)
    {
        _context = context;
    }

    public async Task<Category?> GetByIdAsync(int id)
    {
        return await _context.Categories.FindAsync(id);
    }

    public async Task<IEnumerable<Category>> GetAllAsync()
    {
        return await _context.Categories
            .OrderBy(c => c.SortOrder)
            .ToListAsync();
    }

    public async Task<IEnumerable<Category>> GetActiveAsync()
    {
        return await _context.Categories
            .Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder)
            .ToListAsync();
    }

    public async Task<Category> CreateAsync(Category category)
    {
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task<Category> UpdateAsync(Category category)
    {
        _context.Categories.Update(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task DeleteAsync(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category != null)
        {
            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
        }
    }
}