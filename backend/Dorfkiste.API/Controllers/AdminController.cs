using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Dorfkiste.Core.Entities;
using Dorfkiste.Core.Interfaces;

namespace Dorfkiste.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly IReportService _reportService;
    private readonly IUserRepository _userRepository;
    private readonly IOfferRepository _offerRepository;
    private readonly ILogger<AdminController> _logger;

    private readonly IAuthService _authService;

    public AdminController(
        IReportService reportService,
        IUserRepository userRepository,
        IOfferRepository offerRepository,
        IAuthService authService,
        ILogger<AdminController> logger)
    {
        _reportService = reportService;
        _userRepository = userRepository;
        _offerRepository = offerRepository;
        _authService = authService;
        _logger = logger;
    }

    [HttpGet("reports")]
    public async Task<ActionResult<IEnumerable<ReportDto>>> GetAllReports()
    {
        if (!IsAdmin())
        {
            return Forbid("Only administrators can view all reports.");
        }

        var reports = await _reportService.GetAllReportsAsync();
        var reportDtos = reports.Select(MapToReportDto);
        return Ok(reportDtos);
    }

    [HttpGet("reports/pending")]
    public async Task<ActionResult<IEnumerable<ReportDto>>> GetPendingReports()
    {
        if (!IsAdmin())
        {
            return Forbid("Only administrators can view pending reports.");
        }

        var reports = await _reportService.GetPendingReportsAsync();
        var reportDtos = reports.Select(MapToReportDto);
        return Ok(reportDtos);
    }

    [HttpPut("reports/{id}/review")]
    public async Task<ActionResult<ReportDto>> ReviewReport(int id, [FromBody] ReviewReportRequest request)
    {
        if (!IsAdmin())
        {
            return Forbid("Only administrators can review reports.");
        }

        var adminId = GetCurrentUserId();

        try
        {
            var report = await _reportService.ReviewReportAsync(
                id,
                adminId,
                request.Status,
                request.ResolutionNotes);

            return Ok(MapToReportDto(report));
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    [HttpDelete("offers/{offerId}/remove")]
    public async Task<IActionResult> RemoveOffer(int offerId)
    {
        if (!IsAdmin())
        {
            return Forbid("Only administrators can remove offers.");
        }

        var adminId = GetCurrentUserId();

        try
        {
            await _reportService.RemoveReportedOfferAsync(offerId, adminId);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    [HttpPost("users/{userId}/suspend")]
    public async Task<IActionResult> SuspendUser(int userId, [FromBody] SuspendUserRequest? request)
    {
        if (!IsAdmin())
        {
            return Forbid("Only administrators can suspend users.");
        }

        var adminId = GetCurrentUserId();

        try
        {
            await _reportService.SuspendUserAsync(userId, adminId, request?.SuspensionEndDate);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<AdminUserDto>>> GetAllUsers()
    {
        if (!IsAdmin())
        {
            return Forbid("Only administrators can view all users.");
        }

        var users = await _userRepository.GetAllAsync();

        var userDtos = users.Select(u => new AdminUserDto
        {
            Id = u.Id,
            Email = u.Email,
            FirstName = u.FirstName,
            LastName = u.LastName,
            IsActive = u.IsActive,
            IsAdmin = u.IsAdmin,
            EmailVerified = u.EmailVerified,
            CreatedAt = u.CreatedAt,
            LastLoginAt = u.LastLoginAt,
            ContactInfo = u.ContactInfo != null ? new AdminContactInfoDto
            {
                PhoneNumber = u.ContactInfo.PhoneNumber,
                MobileNumber = u.ContactInfo.MobileNumber,
                Street = u.ContactInfo.Street,
                City = u.ContactInfo.City,
                PostalCode = u.ContactInfo.PostalCode,
                State = u.ContactInfo.State,
                Country = u.ContactInfo.Country
            } : null,
            PrivacySettings = u.PrivacySettings != null ? new AdminPrivacySettingsDto
            {
                MarketingEmailsConsent = u.PrivacySettings.MarketingEmailsConsent,
                DataProcessingConsent = u.PrivacySettings.DataProcessingConsent,
                ProfileVisibilityConsent = u.PrivacySettings.ProfileVisibilityConsent,
                DataSharingConsent = u.PrivacySettings.DataSharingConsent,
                ShowPhoneNumber = u.PrivacySettings.ShowPhoneNumber,
                ShowMobileNumber = u.PrivacySettings.ShowMobileNumber,
                ShowStreet = u.PrivacySettings.ShowStreet,
                ShowCity = u.PrivacySettings.ShowCity,
                MarketingEmailsConsentDate = u.PrivacySettings.MarketingEmailsConsentDate,
                DataProcessingConsentDate = u.PrivacySettings.DataProcessingConsentDate,
                ProfileVisibilityConsentDate = u.PrivacySettings.ProfileVisibilityConsentDate,
                DataSharingConsentDate = u.PrivacySettings.DataSharingConsentDate
            } : null
        });

        return Ok(userDtos);
    }

    [HttpPost("offers/{offerId}/toggle-active")]
    public async Task<ActionResult> ToggleOfferActive(int offerId)
    {
        if (!IsAdmin())
        {
            return Forbid("Only administrators can toggle offer status.");
        }

        var offer = await _offerRepository.GetByIdAsync(offerId);
        if (offer == null)
        {
            return NotFound(new { message = "Angebot nicht gefunden." });
        }

        offer.IsActive = !offer.IsActive;
        await _offerRepository.UpdateAsync(offer);

        _logger.LogInformation("Admin {AdminId} toggled offer {OfferId} active status to {IsActive}",
            GetCurrentUserId(), offerId, offer.IsActive);

        return Ok(new { message = offer.IsActive ? "Angebot aktiviert." : "Angebot deaktiviert.", isActive = offer.IsActive });
    }

    [HttpPost("users/{userId}/toggle-admin")]
    public async Task<ActionResult> ToggleUserAdminStatus(int userId)
    {
        if (!IsAdmin())
        {
            return Forbid("Only administrators can modify admin status.");
        }

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "Benutzer nicht gefunden." });
        }

        user.IsAdmin = !user.IsAdmin;
        await _userRepository.UpdateAsync(user);

        _logger.LogInformation("Admin {AdminId} toggled user {UserId} admin status to {IsAdmin}",
            GetCurrentUserId(), userId, user.IsAdmin);

        return Ok(new { message = user.IsAdmin ? "Benutzer ist jetzt Admin." : "Admin-Rechte entfernt.", isAdmin = user.IsAdmin });
    }

    [HttpPost("users/{userId}/send-verification-email")]
    public async Task<ActionResult> SendVerificationEmail(int userId)
    {
        if (!IsAdmin())
        {
            return Forbid("Only administrators can send verification emails.");
        }

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "Benutzer nicht gefunden." });
        }

        if (user.EmailVerified)
        {
            return BadRequest(new { message = "E-Mail-Adresse ist bereits verifiziert." });
        }

        var success = await _authService.ResendVerificationEmailAsync(user.Email);
        if (!success)
        {
            return StatusCode(500, new { message = "Fehler beim Senden der Verifizierungs-E-Mail." });
        }

        _logger.LogInformation("Admin {AdminId} sent verification email to user {UserId}",
            GetCurrentUserId(), userId);

        return Ok(new { message = "Verifizierungs-E-Mail wurde erfolgreich gesendet." });
    }

    [HttpPut("users/{userId}")]
    public async Task<ActionResult> UpdateUser(int userId, [FromBody] UpdateUserRequest request)
    {
        if (!IsAdmin())
        {
            return Forbid("Only administrators can update user data.");
        }

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "Benutzer nicht gefunden." });
        }

        // Update basic info
        if (!string.IsNullOrWhiteSpace(request.FirstName))
            user.FirstName = request.FirstName;

        if (!string.IsNullOrWhiteSpace(request.LastName))
            user.LastName = request.LastName;

        // Update contact info
        if (request.ContactInfo != null)
        {
            if (user.ContactInfo == null)
                user.ContactInfo = new ContactInfo();

            user.ContactInfo.PhoneNumber = request.ContactInfo.PhoneNumber;
            user.ContactInfo.MobileNumber = request.ContactInfo.MobileNumber;
            user.ContactInfo.Street = request.ContactInfo.Street;
            user.ContactInfo.City = request.ContactInfo.City;
            user.ContactInfo.PostalCode = request.ContactInfo.PostalCode;
            user.ContactInfo.State = request.ContactInfo.State;
            user.ContactInfo.Country = request.ContactInfo.Country;
        }

        // Update privacy settings
        if (request.PrivacySettings != null)
        {
            if (user.PrivacySettings == null)
                user.PrivacySettings = new UserPrivacySettings { UserId = userId };

            user.PrivacySettings.MarketingEmailsConsent = request.PrivacySettings.MarketingEmailsConsent;
            user.PrivacySettings.DataProcessingConsent = request.PrivacySettings.DataProcessingConsent;
            user.PrivacySettings.ProfileVisibilityConsent = request.PrivacySettings.ProfileVisibilityConsent;
            user.PrivacySettings.DataSharingConsent = request.PrivacySettings.DataSharingConsent;
            user.PrivacySettings.ShowPhoneNumber = request.PrivacySettings.ShowPhoneNumber;
            user.PrivacySettings.ShowMobileNumber = request.PrivacySettings.ShowMobileNumber;
            user.PrivacySettings.ShowStreet = request.PrivacySettings.ShowStreet;
            user.PrivacySettings.ShowCity = request.PrivacySettings.ShowCity;
            user.PrivacySettings.UpdatedAt = DateTime.UtcNow;
        }

        await _userRepository.UpdateAsync(user);

        _logger.LogInformation("Admin {AdminId} updated user {UserId} data",
            GetCurrentUserId(), userId);

        return Ok(new { message = "Benutzerdaten erfolgreich aktualisiert." });
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim!);
    }

    private bool IsAdmin()
    {
        var isAdminClaim = User.FindFirst("IsAdmin")?.Value;
        return bool.TryParse(isAdminClaim, out var isAdmin) && isAdmin;
    }

    private static ReportDto MapToReportDto(Report report)
    {
        return new ReportDto
        {
            Id = report.Id,
            ReportType = report.ReportType.ToString(),
            Description = report.Description,
            Status = report.Status.ToString(),
            ResolutionNotes = report.ResolutionNotes,
            CreatedAt = report.CreatedAt,
            ReviewedAt = report.ReviewedAt,
            ReporterId = report.ReporterId,
            ReportedOfferId = report.ReportedOfferId,
            ReportedUserId = report.ReportedUserId,
            ReportedMessageId = report.ReportedMessageId,
            Reporter = report.Reporter != null ? new ReportUserDto
            {
                Id = report.Reporter.Id,
                FirstName = report.Reporter.FirstName,
                LastName = report.Reporter.LastName
            } : null,
            ReportedOffer = report.ReportedOffer != null ? new ReportOfferDto
            {
                Id = report.ReportedOffer.Id,
                Title = report.ReportedOffer.Title,
                IsActive = report.ReportedOffer.IsActive
            } : null,
            ReportedUser = report.ReportedUser != null ? new ReportUserDto
            {
                Id = report.ReportedUser.Id,
                FirstName = report.ReportedUser.FirstName,
                LastName = report.ReportedUser.LastName
            } : null,
            ReviewedBy = report.ReviewedBy != null ? new ReportUserDto
            {
                Id = report.ReviewedBy.Id,
                FirstName = report.ReviewedBy.FirstName,
                LastName = report.ReviewedBy.LastName
            } : null
        };
    }
}

public class ReviewReportRequest
{
    public ReportStatus Status { get; set; }
    public string? ResolutionNotes { get; set; }
}

public class SuspendUserRequest
{
    public DateTime? SuspensionEndDate { get; set; }
}

public class AdminUserDto
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool IsAdmin { get; set; }
    public bool EmailVerified { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public AdminContactInfoDto? ContactInfo { get; set; }
    public AdminPrivacySettingsDto? PrivacySettings { get; set; }
}

public class AdminContactInfoDto
{
    public string? PhoneNumber { get; set; }
    public string? MobileNumber { get; set; }
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? PostalCode { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
}

public class UpdateUserRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public AdminContactInfoDto? ContactInfo { get; set; }
    public AdminPrivacySettingsDto? PrivacySettings { get; set; }
}

public class AdminPrivacySettingsDto
{
    public bool MarketingEmailsConsent { get; set; }
    public bool DataProcessingConsent { get; set; }
    public bool ProfileVisibilityConsent { get; set; }
    public bool DataSharingConsent { get; set; }
    public bool ShowPhoneNumber { get; set; }
    public bool ShowMobileNumber { get; set; }
    public bool ShowStreet { get; set; }
    public bool ShowCity { get; set; }
    public DateTime? MarketingEmailsConsentDate { get; set; }
    public DateTime? DataProcessingConsentDate { get; set; }
    public DateTime? ProfileVisibilityConsentDate { get; set; }
    public DateTime? DataSharingConsentDate { get; set; }
}
