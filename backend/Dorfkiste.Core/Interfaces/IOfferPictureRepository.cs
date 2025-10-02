using Dorfkiste.Core.Entities;

namespace Dorfkiste.Core.Interfaces;

public interface IOfferPictureRepository
{
    Task<OfferPicture> CreateAsync(OfferPicture picture);
    Task<OfferPicture?> GetByIdAsync(int id);
    Task<IEnumerable<OfferPicture>> GetByOfferIdAsync(int offerId);
    Task<OfferPicture> UpdateAsync(OfferPicture picture);
    Task DeleteAsync(int id);
    Task<int> GetMaxDisplayOrderForOfferAsync(int offerId);
}