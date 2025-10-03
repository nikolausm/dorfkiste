using Dorfkiste.Core.Entities;

namespace Dorfkiste.Core.Interfaces;

public interface IRentalContractRepository
{
    Task<RentalContract?> GetByIdAsync(int id);
    Task<RentalContract?> GetByBookingIdAsync(int bookingId);
    Task<List<RentalContract>> GetContractsByUserIdAsync(int userId);
    Task<List<RentalContract>> GetContractsByLessorIdAsync(int lessorId);
    Task<List<RentalContract>> GetContractsByLesseeIdAsync(int lesseeId);
    Task<RentalContract> CreateAsync(RentalContract contract);
    Task<RentalContract> UpdateAsync(RentalContract contract);
    Task DeleteAsync(int id);
}
