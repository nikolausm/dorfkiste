using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Dorfkiste.Core.Entities;
using Dorfkiste.Core.Interfaces;

namespace Dorfkiste.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;
    private readonly ILogger<ReportsController> _logger;

    public ReportsController(IReportService reportService, ILogger<ReportsController> logger)
    {
        _reportService = reportService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<ActionResult<ReportDto>> SubmitReport([FromBody] SubmitReportRequest request)
    {
        var reporterId = GetCurrentUserId();

        try
        {
            var report = await _reportService.SubmitReportAsync(
                reporterId,
                request.ReportType,
                request.Description,
                request.ReportedOfferId,
                request.ReportedUserId,
                request.ReportedMessageId);

            return Ok(MapToReportDto(report));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("my-reports")]
    public async Task<ActionResult<IEnumerable<ReportDto>>> GetMyReports()
    {
        var userId = GetCurrentUserId();
        var reports = await _reportService.GetUserReportsAsync(userId);
        var reportDtos = reports.Select(MapToReportDto);
        return Ok(reportDtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ReportDto>> GetReport(int id)
    {
        var userId = GetCurrentUserId();

        try
        {
            var report = await _reportService.GetReportByIdAsync(id);
            if (report == null)
            {
                return NotFound("Report not found.");
            }

            // Only allow reporter or admin to view report details
            if (report.ReporterId != userId && !IsAdmin())
            {
                return Forbid();
            }

            return Ok(MapToReportDto(report));
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
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

public class SubmitReportRequest
{
    public ReportType ReportType { get; set; }
    public string Description { get; set; } = string.Empty;
    public int? ReportedOfferId { get; set; }
    public int? ReportedUserId { get; set; }
    public int? ReportedMessageId { get; set; }
}

public class ReportDto
{
    public int Id { get; set; }
    public string ReportType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? ResolutionNotes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public int ReporterId { get; set; }
    public int? ReportedOfferId { get; set; }
    public int? ReportedUserId { get; set; }
    public int? ReportedMessageId { get; set; }
    public ReportUserDto? Reporter { get; set; }
    public ReportOfferDto? ReportedOffer { get; set; }
    public ReportUserDto? ReportedUser { get; set; }
    public ReportUserDto? ReviewedBy { get; set; }
}

public class ReportUserDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
}

public class ReportOfferDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
