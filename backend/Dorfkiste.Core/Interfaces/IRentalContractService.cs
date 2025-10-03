using Dorfkiste.Core.Entities;

namespace Dorfkiste.Core.Interfaces;

public interface IRentalContractService
{
    Task<RentalContract?> GetContractByIdAsync(int contractId);
    Task<RentalContract?> GetContractByBookingIdAsync(int bookingId);
    Task<List<RentalContract>> GetUserContractsAsync(int userId);
    Task<RentalContract> GenerateContractFromBookingAsync(int bookingId);
    Task<RentalContract> SignContractAsync(int contractId, int userId);
    Task<byte[]> GenerateContractPdfAsync(int contractId);
    Task<RentalContract> CancelContractAsync(int contractId, string reason);
}
