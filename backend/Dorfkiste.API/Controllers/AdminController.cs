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
    private readonly ILogger<AdminController> _logger;

    public AdminController(IReportService reportService, ILogger<AdminController> logger)
    {
        _reportService = reportService;
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
