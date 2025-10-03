using Dorfkiste.Core.Entities;

namespace Dorfkiste.Core.Interfaces;

public interface IOfferRepository
{
    Task<Offer?> GetByIdAsync(int id);
    Task<IEnumerable<Offer>> GetAllAsync();
    Task<IEnumerable<Offer>> GetByCategoryAsync(int categoryId);
    Task<IEnumerable<Offer>> GetByUserAsync(int userId);
    Task<IEnumerable<Offer>> SearchAsync(string searchTerm);
    Task<Offer> CreateAsync(Offer offer);
    Task<Offer> UpdateAsync(Offer offer);
    Task DeleteAsync(int id);
    Task<IEnumerable<Offer>> GetActiveAsync();
    Task<IEnumerable<Offer>> GetByUserIdAsync(int userId);
}