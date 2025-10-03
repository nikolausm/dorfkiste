using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Dorfkiste.Core.Entities;
using Dorfkiste.Core.Interfaces;

namespace Dorfkiste.API.Controllers;

[ApiController]
[Route("api/rental-contracts")]
[Authorize]
public class RentalContractsController : ControllerBase
{
    private readonly IRentalContractService _contractService;
    private readonly ILogger<RentalContractsController> _logger;

    public RentalContractsController(
        IRentalContractService contractService,
        ILogger<RentalContractsController> logger)
    {
        _contractService = contractService;
        _logger = logger;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? "0");
    }

    /// <summary>
    /// Generate a rental contract from a booking
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(RentalContractDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GenerateContract([FromBody] GenerateContractRequest request)
    {
        try
        {
            var contract = await _contractService.GenerateContractFromBookingAsync(request.BookingId);
            var dto = MapToDto(contract);

            _logger.LogInformation("Generated contract {ContractId} for booking {BookingId}", contract.Id, request.BookingId);
            return CreatedAtAction(nameof(GetContract), new { id = contract.Id }, dto);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Failed to generate contract for booking {BookingId}", request.BookingId);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get contract details by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(RentalContractDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetContract(int id)
    {
        var contract = await _contractService.GetContractByIdAsync(id);
        if (contract == null)
        {
            return NotFound(new { error = "Vertrag nicht gefunden" });
        }

        var userId = GetCurrentUserId();
        if (contract.LessorId != userId && contract.LesseeId != userId)
        {
            _logger.LogWarning("User {UserId} attempted to access contract {ContractId} without permission", userId, id);
            return Forbid();
        }

        return Ok(MapToDto(contract));
    }

    /// <summary>
    /// Get contract by booking ID
    /// </summary>
    [HttpGet("booking/{bookingId}")]
    [ProducesResponseType(typeof(RentalContractDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetContractByBooking(int bookingId)
    {
        var contract = await _contractService.GetContractByBookingIdAsync(bookingId);
        if (contract == null)
        {
            return NotFound(new { error = "Kein Vertrag für diese Buchung gefunden" });
        }

        var userId = GetCurrentUserId();
        if (contract.LessorId != userId && contract.LesseeId != userId)
        {
            return Forbid();
        }

        return Ok(MapToDto(contract));
    }

    /// <summary>
    /// Get all contracts for current user
    /// </summary>
    [HttpGet("my-contracts")]
    [ProducesResponseType(typeof(List<RentalContractDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyContracts()
    {
        var userId = GetCurrentUserId();
        var contracts = await _contractService.GetUserContractsAsync(userId);
        var dtos = contracts.Select(MapToDto).ToList();

        return Ok(dtos);
    }

    /// <summary>
    /// Sign a contract (lessor or lessee)
    /// </summary>
    [HttpPost("{id}/sign")]
    [ProducesResponseType(typeof(RentalContractDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> SignContract(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var contract = await _contractService.SignContractAsync(id, userId);

            _logger.LogInformation("User {UserId} signed contract {ContractId}", userId, id);
            return Ok(MapToDto(contract));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized sign attempt for contract {ContractId}", id);
            return Forbid();
        }
    }

    /// <summary>
    /// Download contract as PDF
    /// </summary>
    [HttpGet("{id}/pdf")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DownloadContractPdf(int id)
    {
        var contract = await _contractService.GetContractByIdAsync(id);
        if (contract == null)
        {
            return NotFound(new { error = "Vertrag nicht gefunden" });
        }

        var userId = GetCurrentUserId();
        if (contract.LessorId != userId && contract.LesseeId != userId)
        {
            return Forbid();
        }

        try
        {
            var pdfBytes = await _contractService.GenerateContractPdfAsync(id);
            var fileName = $"Mietvertrag_{contract.Id}_{DateTime.UtcNow:yyyyMMdd}.pdf";

            _logger.LogInformation("Generated PDF for contract {ContractId}", id);
            return File(pdfBytes, "application/pdf", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate PDF for contract {ContractId}", id);
            return StatusCode(500, new { error = "PDF-Generierung fehlgeschlagen" });
        }
    }

    /// <summary>
    /// Cancel a contract
    /// </summary>
    [HttpPost("{id}/cancel")]
    [ProducesResponseType(typeof(RentalContractDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CancelContract(int id, [FromBody] CancelContractRequest request)
    {
        var contract = await _contractService.GetContractByIdAsync(id);
        if (contract == null)
        {
            return NotFound(new { error = "Vertrag nicht gefunden" });
        }

        var userId = GetCurrentUserId();
        if (contract.LessorId != userId && contract.LesseeId != userId)
        {
            return Forbid();
        }

        try
        {
            var cancelledContract = await _contractService.CancelContractAsync(id, request.Reason ?? "Keine Angabe");
            _logger.LogInformation("Contract {ContractId} cancelled by user {UserId}", id, userId);
            return Ok(MapToDto(cancelledContract));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    private RentalContractDto MapToDto(RentalContract contract)
    {
        return new RentalContractDto
        {
            Id = contract.Id,
            BookingId = contract.BookingId,
            LessorId = contract.LessorId,
            LesseeId = contract.LesseeId,
            LessorName = $"{contract.Lessor.FirstName} {contract.Lessor.LastName}",
            LesseeName = $"{contract.Lessee.FirstName} {contract.Lessee.LastName}",
            LessorEmail = contract.Lessor.Email,
            LesseeEmail = contract.Lessee.Email,
            OfferTitle = contract.OfferTitle,
            OfferDescription = contract.OfferDescription,
            OfferType = contract.OfferType,
            RentalStartDate = contract.RentalStartDate,
            RentalEndDate = contract.RentalEndDate,
            RentalDays = contract.RentalDays,
            TotalPrice = contract.TotalPrice,
            DepositAmount = contract.DepositAmount,
            PricePerDay = contract.PricePerDay,
            TermsAndConditions = contract.TermsAndConditions,
            SpecialConditions = contract.SpecialConditions,
            CreatedAt = contract.CreatedAt,
            SignedByLessorAt = contract.SignedByLessorAt,
            SignedByLesseeAt = contract.SignedByLesseeAt,
            Status = contract.Status.ToString(),
            LastModifiedAt = contract.LastModifiedAt,
            CancellationReason = contract.CancellationReason,
            CancelledAt = contract.CancelledAt
        };
    }
}

public record GenerateContractRequest(int BookingId);

public record CancelContractRequest(string? Reason);

public class RentalContractDto
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public int LessorId { get; set; }
    public int LesseeId { get; set; }
    public string LessorName { get; set; } = string.Empty;
    public string LesseeName { get; set; } = string.Empty;
    public string LessorEmail { get; set; } = string.Empty;
    public string LesseeEmail { get; set; } = string.Empty;
    public string OfferTitle { get; set; } = string.Empty;
    public string OfferDescription { get; set; } = string.Empty;
    public string OfferType { get; set; } = string.Empty;
    public DateOnly RentalStartDate { get; set; }
    public DateOnly RentalEndDate { get; set; }
    public int RentalDays { get; set; }
    public decimal TotalPrice { get; set; }
    public decimal DepositAmount { get; set; }
    public decimal PricePerDay { get; set; }
    public string TermsAndConditions { get; set; } = string.Empty;
    public string SpecialConditions { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? SignedByLessorAt { get; set; }
    public DateTime? SignedByLesseeAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? LastModifiedAt { get; set; }
    public string? CancellationReason { get; set; }
    public DateTime? CancelledAt { get; set; }
}
