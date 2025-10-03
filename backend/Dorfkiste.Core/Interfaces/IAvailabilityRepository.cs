using Dorfkiste.Core.Entities;

namespace Dorfkiste.Core.Interfaces;

public interface IAvailabilityRepository
{
    Task<IEnumerable<AvailabilityOverride>> GetByOfferIdAsync(int offerId);
    Task<IEnumerable<AvailabilityOverride>> GetByOfferIdAndDateRangeAsync(int offerId, DateOnly startDate, DateOnly endDate);
    Task<AvailabilityOverride?> GetByOfferIdAndDateAsync(int offerId, DateOnly date);
    Task<AvailabilityOverride> CreateAsync(AvailabilityOverride availabilityOverride);
    Task<AvailabilityOverride> UpdateAsync(AvailabilityOverride availabilityOverride);
    Task DeleteAsync(int id);
    Task DeleteByOfferIdAndDateAsync(int offerId, DateOnly date);
}