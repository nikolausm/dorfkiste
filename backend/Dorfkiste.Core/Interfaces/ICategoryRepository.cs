using Dorfkiste.Core.Entities;

namespace Dorfkiste.Core.Interfaces;

public interface ICategoryRepository
{
    Task<Category?> GetByIdAsync(int id);
    Task<IEnumerable<Category>> GetAllAsync();
    Task<IEnumerable<Category>> GetActiveAsync();
    Task<Category> CreateAsync(Category category);
    Task<Category> UpdateAsync(Category category);
    Task DeleteAsync(int id);
}