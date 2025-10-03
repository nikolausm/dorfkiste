using Dorfkiste.Core.Entities;
using Dorfkiste.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace Dorfkiste.Application.Services;

public class RentalContractService : IRentalContractService
{
    private readonly IRentalContractRepository _contractRepository;
    private readonly IBookingRepository _bookingRepository;
    private readonly IOfferRepository _offerRepository;
    private readonly IUserRepository _userRepository;
    private readonly ContractPdfGenerator _pdfGenerator;
    private readonly ILogger<RentalContractService> _logger;

    public RentalContractService(
        IRentalContractRepository contractRepository,
        IBookingRepository bookingRepository,
        IOfferRepository offerRepository,
        IUserRepository userRepository,
        ContractPdfGenerator pdfGenerator,
        ILogger<RentalContractService> logger)
    {
        _contractRepository = contractRepository;
        _bookingRepository = bookingRepository;
        _offerRepository = offerRepository;
        _userRepository = userRepository;
        _pdfGenerator = pdfGenerator;
        _logger = logger;
    }

    public async Task<RentalContract?> GetContractByIdAsync(int contractId)
    {
        return await _contractRepository.GetByIdAsync(contractId);
    }

    public async Task<RentalContract?> GetContractByBookingIdAsync(int bookingId)
    {
        return await _contractRepository.GetByBookingIdAsync(bookingId);
    }

    public async Task<List<RentalContract>> GetUserContractsAsync(int userId)
    {
        return await _contractRepository.GetContractsByUserIdAsync(userId);
    }

    public async Task<RentalContract> GenerateContractFromBookingAsync(int bookingId)
    {
        // Get booking with related data
        var booking = await _bookingRepository.GetByIdAsync(bookingId);
        if (booking == null)
        {
            throw new InvalidOperationException($"Buchung mit ID {bookingId} nicht gefunden.");
        }

        // Check if contract already exists
        var existingContract = await _contractRepository.GetByBookingIdAsync(bookingId);
        if (existingContract != null)
        {
            _logger.LogInformation("Contract already exists for booking {BookingId}", bookingId);
            return existingContract;
        }

        // Get offer details
        var offer = await _offerRepository.GetByIdAsync(booking.OfferId);
        if (offer == null)
        {
            throw new InvalidOperationException($"Angebot mit ID {booking.OfferId} nicht gefunden.");
        }

        // Get users
        var lessor = await _userRepository.GetByIdAsync(offer.UserId);
        var lessee = await _userRepository.GetByIdAsync(booking.CustomerId);

        if (lessor == null || lessee == null)
        {
            throw new InvalidOperationException("Vermieter oder Mieter nicht gefunden.");
        }

        // Calculate deposit (20% of total price)
        var depositAmount = booking.TotalPrice * 0.20m;

        // Create contract
        var contract = new RentalContract
        {
            BookingId = booking.Id,
            LessorId = lessor.Id,
            LesseeId = lessee.Id,
            OfferTitle = offer.Title,
            OfferDescription = offer.Description,
            OfferType = offer.IsService ? "Service" : "Item",
            RentalStartDate = booking.StartDate,
            RentalEndDate = booking.EndDate,
            RentalDays = booking.DaysCount,
            TotalPrice = booking.TotalPrice,
            DepositAmount = depositAmount,
            PricePerDay = offer.PricePerDay ?? offer.PricePerHour ?? 0,
            TermsAndConditions = GetDefaultTermsAndConditions(offer.IsService ? "Service" : "Item"),
            SpecialConditions = string.Empty,
            CreatedAt = DateTime.UtcNow,
            Status = ContractStatus.Draft
        };

        var createdContract = await _contractRepository.CreateAsync(contract);
        _logger.LogInformation("Generated rental contract {ContractId} for booking {BookingId}", createdContract.Id, bookingId);

        return createdContract;
    }

    public async Task<RentalContract> SignContractAsync(int contractId, int userId)
    {
        var contract = await _contractRepository.GetByIdAsync(contractId);
        if (contract == null)
        {
            throw new InvalidOperationException($"Vertrag mit ID {contractId} nicht gefunden.");
        }

        var now = DateTime.UtcNow;

        // Determine if user is lessor or lessee
        if (userId == contract.LessorId)
        {
            if (contract.SignedByLessorAt.HasValue)
            {
                throw new InvalidOperationException("Vertrag wurde bereits vom Vermieter unterschrieben.");
            }

            contract.SignedByLessorAt = now;
            contract.Status = ContractStatus.SignedByLessor;
            _logger.LogInformation("Contract {ContractId} signed by lessor {LessorId}", contractId, userId);
        }
        else if (userId == contract.LesseeId)
        {
            if (contract.SignedByLesseeAt.HasValue)
            {
                throw new InvalidOperationException("Vertrag wurde bereits vom Mieter unterschrieben.");
            }

            contract.SignedByLesseeAt = now;

            // If lessor already signed, contract is now fully signed
            if (contract.SignedByLessorAt.HasValue)
            {
                contract.Status = ContractStatus.SignedByBoth;
            }

            _logger.LogInformation("Contract {ContractId} signed by lessee {LesseeId}", contractId, userId);
        }
        else
        {
            throw new UnauthorizedAccessException("Benutzer ist nicht berechtigt, diesen Vertrag zu unterschreiben.");
        }

        // Update contract status to Active if both parties have signed
        if (contract.SignedByLessorAt.HasValue && contract.SignedByLesseeAt.HasValue)
        {
            contract.Status = ContractStatus.Active;
            _logger.LogInformation("Contract {ContractId} is now active (both parties signed)", contractId);
        }

        return await _contractRepository.UpdateAsync(contract);
    }

    public async Task<byte[]> GenerateContractPdfAsync(int contractId)
    {
        var contract = await _contractRepository.GetByIdAsync(contractId);
        if (contract == null)
        {
            throw new InvalidOperationException($"Vertrag mit ID {contractId} nicht gefunden.");
        }

        _logger.LogInformation("Generating PDF for contract {ContractId}", contractId);
        return _pdfGenerator.GeneratePdf(contract);
    }

    public async Task<RentalContract> CancelContractAsync(int contractId, string reason)
    {
        var contract = await _contractRepository.GetByIdAsync(contractId);
        if (contract == null)
        {
            throw new InvalidOperationException($"Vertrag mit ID {contractId} nicht gefunden.");
        }

        if (contract.Status == ContractStatus.Cancelled)
        {
            throw new InvalidOperationException("Vertrag wurde bereits storniert.");
        }

        if (contract.Status == ContractStatus.Completed)
        {
            throw new InvalidOperationException("Abgeschlossene Verträge können nicht storniert werden.");
        }

        contract.Status = ContractStatus.Cancelled;
        contract.CancellationReason = reason;
        contract.CancelledAt = DateTime.UtcNow;

        _logger.LogInformation("Contract {ContractId} cancelled. Reason: {Reason}", contractId, reason);

        return await _contractRepository.UpdateAsync(contract);
    }

    private string GetDefaultTermsAndConditions(string offerType)
    {
        var baseTerms = @"ALLGEMEINE MIETBEDINGUNGEN

1. VERTRAGSGEGENSTAND
Der Vermieter überlässt dem Mieter den oben beschriebenen Gegenstand/die Dienstleistung zur Nutzung gemäß den vereinbarten Bedingungen.

2. MIETDAUER UND MIETPREIS
Die Mietdauer und der Mietpreis ergeben sich aus den oben genannten Vertragsdetails. Der Gesamtpreis ist bei Übergabe zu zahlen.

3. KAUTION
Der Mieter hinterlegt eine Kaution in Höhe des oben genannten Betrags. Die Kaution wird nach ordnungsgemäßer Rückgabe des Mietgegenstands zurückerstattet.

4. PFLICHTEN DES MIETERS
- Sorgfältige und bestimmungsgemäße Nutzung
- Keine Weitervermietung ohne Zustimmung des Vermieters
- Sofortige Meldung von Schäden oder Mängeln
- Pünktliche Rückgabe in sauberem Zustand

5. HAFTUNG
Der Mieter haftet für alle Schäden, die während der Mietzeit entstehen, sofern diese auf unsachgemäße Behandlung oder Fahrlässigkeit zurückzuführen sind.

6. RÜCKGABE
Der Mietgegenstand ist zum vereinbarten Zeitpunkt in ordnungsgemäßem Zustand zurückzugeben. Bei verspäteter Rückgabe können zusätzliche Gebühren anfallen.

7. STORNIERUNG
Stornierungen müssen rechtzeitig erfolgen. Die Stornierungsbedingungen richten sich nach den Allgemeinen Geschäftsbedingungen von Dorfkiste.

8. HAFTUNGSAUSSCHLUSS
Der Vermieter haftet nicht für Schäden, die durch normale Abnutzung oder höhere Gewalt entstehen.";

        if (offerType == "Service")
        {
            baseTerms += @"

9. BESONDERE BEDINGUNGEN FÜR DIENSTLEISTUNGEN
- Die Dienstleistung wird nach bestem Wissen und Gewissen erbracht
- Terminverschiebungen müssen mindestens 24 Stunden im Voraus erfolgen
- Bei Nichterscheinen ohne Absage wird die volle Gebühr berechnet";
        }
        else
        {
            baseTerms += @"

9. BESONDERE BEDINGUNGEN FÜR GEGENSTÄNDE
- Der Mietgegenstand bleibt Eigentum des Vermieters
- Technische Einweisungen sind zu befolgen
- Betriebsstoffe (z.B. Benzin, Öl) sind vom Mieter zu tragen";
        }

        return baseTerms;
    }
}
