using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Dorfkiste.Core.Interfaces;
using Dorfkiste.Core.Entities;

namespace Dorfkiste.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OffersController : ControllerBase
{
    private readonly IOfferRepository _offerRepository;
    private readonly IOfferService _offerService;
    private readonly IReportRepository _reportRepository;

    public OffersController(IOfferRepository offerRepository, IOfferService offerService, IReportRepository reportRepository)
    {
        _offerRepository = offerRepository;
        _offerService = offerService;
        _reportRepository = reportRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OfferDto>>> GetOffers([FromQuery] int? categoryId, [FromQuery] string? search)
    {
        IEnumerable<Offer> offers;

        if (!string.IsNullOrEmpty(search))
        {
            offers = await _offerRepository.SearchAsync(search);
        }
        else if (categoryId.HasValue)
        {
            offers = await _offerRepository.GetByCategoryAsync(categoryId.Value);
        }
        else
        {
            offers = await _offerRepository.GetActiveAsync();
        }

        var offerDtos = offers.Select(MapToOfferDto);
        return Ok(offerDtos);
    }

    [HttpGet("{idOrSlug}")]
    public async Task<ActionResult<OfferDetailDto>> GetOffer(string idOrSlug)
    {
        Offer? offer = null;

        // Try to parse as ID first
        if (int.TryParse(idOrSlug, out int id))
        {
            offer = await _offerRepository.GetByIdAsync(id);
        }

        // If not found or not an ID, try slug
        if (offer == null)
        {
            offer = await _offerRepository.GetBySlugAsync(idOrSlug);
        }

        if (offer == null)
        {
            return NotFound();
        }

        // Check if user is authenticated
        var isAuthenticated = User.Identity?.IsAuthenticated ?? false;

        var offerDto = MapToOfferDetailDto(offer, isAuthenticated);
        return Ok(offerDto);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<OfferDto>> CreateOffer([FromBody] CreateOfferRequest request)
    {
        var userId = GetCurrentUserId();
        
        var offer = new Offer
        {
            Title = request.Title,
            Description = request.Description,
            PricePerDay = request.PricePerDay,
            PricePerHour = request.PricePerHour,
            SalePrice = request.SalePrice,
            IsService = request.IsService,
            IsForSale = request.IsForSale,
            DeliveryAvailable = request.DeliveryAvailable,
            DeliveryCost = request.DeliveryCost,
            Deposit = request.Deposit,
            CategoryId = request.CategoryId,
            UserId = userId,
            IsActive = true
        };

        var createdOffer = await _offerRepository.CreateAsync(offer);
        var result = await _offerRepository.GetByIdAsync(createdOffer.Id);
        
        return CreatedAtAction(nameof(GetOffer), new { id = createdOffer.Id }, MapToOfferDto(result!));
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<OfferDto>> UpdateOffer(int id, [FromBody] UpdateOfferRequest request)
    {
        var userId = GetCurrentUserId();
        var offer = await _offerRepository.GetByIdAsync(id);

        if (offer == null)
        {
            return NotFound();
        }

        if (offer.UserId != userId)
        {
            return Forbid();
        }

        offer.Title = request.Title;
        offer.Description = request.Description;
        offer.PricePerDay = request.PricePerDay;
        offer.PricePerHour = request.PricePerHour;
        offer.SalePrice = request.SalePrice;
        offer.IsService = request.IsService;
        offer.IsForSale = request.IsForSale;
        offer.DeliveryAvailable = request.DeliveryAvailable;
        offer.DeliveryCost = request.DeliveryCost;
        offer.Deposit = request.Deposit;
        offer.CategoryId = request.CategoryId;
        offer.IsActive = request.IsActive;

        await _offerRepository.UpdateAsync(offer);
        var result = await _offerRepository.GetByIdAsync(id);
        
        return Ok(MapToOfferDto(result!));
    }

    [HttpPatch("{id}/toggle-active")]
    [Authorize]
    public async Task<ActionResult<OfferDto>> ToggleOfferActive(int id)
    {
        var userId = GetCurrentUserId();
        var offer = await _offerRepository.GetByIdAsync(id);

        if (offer == null)
        {
            return NotFound();
        }

        if (offer.UserId != userId)
        {
            return Forbid();
        }

        offer.IsActive = !offer.IsActive;
        await _offerRepository.UpdateAsync(offer);
        
        var result = await _offerRepository.GetByIdAsync(id);
        return Ok(MapToOfferDto(result!));
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteOffer(int id)
    {
        var userId = GetCurrentUserId();
        var offer = await _offerRepository.GetByIdAsync(id);

        if (offer == null)
        {
            return NotFound();
        }

        if (offer.UserId != userId)
        {
            return Forbid();
        }

        await _offerRepository.DeleteAsync(id);
        return NoContent();
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<OfferDto>>> GetUserOffers(int userId)
    {
        var offers = await _offerRepository.GetByUserAsync(userId);
        var offerDtos = offers.Select(MapToOfferDto);
        
        return Ok(offerDtos);
    }

    [HttpGet("my-offers")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<OfferDto>>> GetMyOffers()
    {
        var userId = GetCurrentUserId();
        var offers = await _offerRepository.GetByUserAsync(userId);
        var offerDtos = offers.Select(MapToOfferDto);

        return Ok(offerDtos);
    }

    [HttpPost("test-analyze")]
    [Authorize]
    public async Task<ActionResult<AnalyzeImageResponse>> TestAnalyze(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded");
        }

        // Return a mock response for testing
        return Ok(new AnalyzeImageResponse
        {
            Title = "Test Bohrmaschine",
            Description = "Eine Test-Beschreibung für die Bohrmaschine",
            IsService = false,
            SuggestedCategoryName = "Werkzeuge & Geräte",
            SuggestedCategoryId = 1,
            SuggestedPricePerDay = 15.00m
        });
    }

    [HttpPost("analyze-image")]
    [Authorize]
    public async Task<ActionResult<AnalyzeImageResponse>> AnalyzeImage(IFormFile file, [FromForm] string mode = "rent")
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded");
        }

        if (file.Length > 5 * 1024 * 1024) // 5MB limit
        {
            return BadRequest("File size exceeds 5MB limit");
        }

        var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType.ToLowerInvariant()))
        {
            return BadRequest("Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed");
        }

        // Validate mode parameter
        if (mode != "rent" && mode != "sale")
        {
            return BadRequest("Invalid mode. Must be 'rent' or 'sale'.");
        }

        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream);
        var imageData = memoryStream.ToArray();

        try
        {
            var analysis = await _offerService.AnalyzeImageAndSuggestOfferDataAsync(imageData, mode);

            if (analysis == null)
            {
                // This should not happen with our new implementation, but provide a fallback just in case
                return StatusCode(500, "Die Bildanalyse ist temporär nicht verfügbar. Bitte versuchen Sie es später erneut oder erstellen Sie das Angebot manuell.");
            }

            return Ok(analysis);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Controller error analyzing image: {ex.GetType().Name}: {ex.Message}");
            return StatusCode(500, "Es gab einen Fehler bei der Bildanalyse. Bitte versuchen Sie es erneut oder erstellen Sie das Angebot manuell.");
        }
    }

    [HttpPost("generate-description")]
    [Authorize]
    public async Task<ActionResult<GenerateDescriptionResponse>> GenerateDescriptionFromImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded");
        }

        if (file.Length > 5 * 1024 * 1024) // 5MB limit
        {
            return BadRequest("File size exceeds 5MB limit");
        }

        var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType.ToLowerInvariant()))
        {
            return BadRequest("Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed");
        }

        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream);
        var imageData = memoryStream.ToArray();

        var description = await _offerService.GenerateDescriptionFromImageAsync(imageData);

        if (description == null)
        {
            return StatusCode(500, "Die automatische Beschreibungsgenerierung ist temporär nicht verfügbar. Bitte erstellen Sie eine Beschreibung manuell.");
        }

        return Ok(new GenerateDescriptionResponse
        {
            Description = description
        });
    }

    [HttpPost("{id}/generate-description-from-picture")]
    [Authorize]
    public async Task<ActionResult<GenerateDescriptionResponse>> GenerateDescriptionFromOfferPicture(int id)
    {
        var userId = GetCurrentUserId();
        var offer = await _offerRepository.GetByIdAsync(id);

        if (offer == null)
        {
            return NotFound("Offer not found");
        }

        if (offer.UserId != userId)
        {
            return Forbid("You don't have permission to generate descriptions for this offer");
        }

        var pictures = await _offerService.GetOfferPicturesAsync(id);
        var firstPicture = pictures.OrderBy(p => p.DisplayOrder).FirstOrDefault();

        if (firstPicture == null)
        {
            return BadRequest("No pictures found for this offer. Please upload a picture first.");
        }

        var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
        if (!allowedTypes.Contains(firstPicture.ContentType.ToLowerInvariant()))
        {
            return BadRequest("The first picture has an unsupported format for AI description generation");
        }

        var description = await _offerService.GenerateDescriptionFromImageAsync(firstPicture.ImageData);

        if (description == null)
        {
            return StatusCode(500, "Die automatische Beschreibungsgenerierung ist temporär nicht verfügbar. Bitte erstellen Sie eine Beschreibung manuell.");
        }

        return Ok(new GenerateDescriptionResponse
        {
            Description = description
        });
    }

    [HttpPost("{id}/pictures")]
    [Authorize]
    public async Task<ActionResult<OfferPictureDto>> UploadPicture(int id, IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded");
        }

        if (file.Length > 2 * 1024 * 1024) // 2MB limit
        {
            return BadRequest("File size exceeds 2MB limit");
        }

        var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType.ToLowerInvariant()))
        {
            return BadRequest("Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed");
        }

        var userId = GetCurrentUserId();
        var offer = await _offerRepository.GetByIdAsync(id);

        if (offer == null)
        {
            return NotFound();
        }

        if (offer.UserId != userId)
        {
            return Forbid();
        }

        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream);

        var existingPictures = await _offerService.GetOfferPicturesAsync(id);
        var nextDisplayOrder = existingPictures.Any() ? existingPictures.Max(p => p.DisplayOrder) + 1 : 1;

        var picture = new OfferPicture
        {
            OfferId = id,
            ImageData = memoryStream.ToArray(),
            ContentType = file.ContentType,
            FileName = file.FileName,
            FileSize = file.Length,
            DisplayOrder = nextDisplayOrder,
            CreatedAt = DateTime.UtcNow
        };

        var createdPicture = await _offerService.AddPictureAsync(picture);

        return Ok(new OfferPictureDto
        {
            Id = createdPicture.Id,
            FileName = createdPicture.FileName,
            ContentType = createdPicture.ContentType,
            FileSize = createdPicture.FileSize,
            DisplayOrder = createdPicture.DisplayOrder,
            CreatedAt = createdPicture.CreatedAt
        });
    }

    [HttpGet("pictures/{pictureId}")]
    public async Task<IActionResult> GetPicture(int pictureId)
    {
        var picture = await _offerService.GetPictureAsync(pictureId);

        if (picture == null)
        {
            return NotFound();
        }

        return File(picture.ImageData, picture.ContentType, picture.FileName);
    }

    [HttpDelete("{id}/pictures/{pictureId}")]
    [Authorize]
    public async Task<IActionResult> DeletePicture(int id, int pictureId)
    {
        var userId = GetCurrentUserId();
        var offer = await _offerRepository.GetByIdAsync(id);

        if (offer == null)
        {
            return NotFound("Offer not found");
        }

        if (offer.UserId != userId)
        {
            return Forbid();
        }

        var picture = await _offerService.GetPictureAsync(pictureId);
        if (picture == null || picture.OfferId != id)
        {
            return NotFound("Picture not found");
        }

        await _offerService.DeletePictureAsync(pictureId);
        return NoContent();
    }

    [HttpPut("{id}/pictures/{pictureId}/order")]
    [Authorize]
    public async Task<IActionResult> UpdatePictureOrder(int id, int pictureId, [FromBody] UpdatePictureOrderRequest request)
    {
        var userId = GetCurrentUserId();
        var offer = await _offerRepository.GetByIdAsync(id);

        if (offer == null)
        {
            return NotFound("Offer not found");
        }

        if (offer.UserId != userId)
        {
            return Forbid();
        }

        var picture = await _offerService.GetPictureAsync(pictureId);
        if (picture == null || picture.OfferId != id)
        {
            return NotFound("Picture not found");
        }

        await _offerService.UpdatePictureOrderAsync(pictureId, request.DisplayOrder);
        return NoContent();
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim!);
    }

    private static OfferDto MapToOfferDto(Offer offer)
    {
        return new OfferDto
        {
            Id = offer.Id,
            Slug = offer.Slug,
            Title = offer.Title,
            Description = offer.Description,
            PricePerDay = offer.PricePerDay,
            PricePerHour = offer.PricePerHour,
            SalePrice = offer.SalePrice,
            IsService = offer.IsService,
            IsForSale = offer.IsForSale,
            DeliveryAvailable = offer.DeliveryAvailable,
            DeliveryCost = offer.DeliveryCost,
            Deposit = offer.Deposit,
            ImagePath = offer.ImagePath,
            IsActive = offer.IsActive,
            CreatedAt = offer.CreatedAt,
            Category = offer.Category != null ? new CategoryDto
            {
                Id = offer.Category.Id,
                Name = offer.Category.Name,
                Description = offer.Category.Description,
                IconName = offer.Category.IconName
            } : null,
            User = offer.User != null ? new UserDto
            {
                Id = offer.User.Id,
                Email = offer.User.Email,
                FirstName = offer.User.FirstName,
                LastName = offer.User.LastName
            } : null,
            FirstPicture = offer.Pictures?.OrderBy(p => p.DisplayOrder).FirstOrDefault() is OfferPicture firstPic ? new OfferPictureDto
            {
                Id = firstPic.Id,
                FileName = firstPic.FileName,
                ContentType = firstPic.ContentType,
                FileSize = firstPic.FileSize,
                DisplayOrder = firstPic.DisplayOrder,
                CreatedAt = firstPic.CreatedAt
            } : null
        };
    }

    private static OfferDetailDto MapToOfferDetailDto(Offer offer, bool isAuthenticated)
    {
        ContactInfoDto? contactInfo = null;

        // Only include contact information if user is authenticated
        if (isAuthenticated && offer.User?.ContactInfo != null)
        {
            var privacySettings = offer.User.PrivacySettings;
            contactInfo = new ContactInfoDto
            {
                PhoneNumber = privacySettings?.ShowPhoneNumber == true ? offer.User.ContactInfo.PhoneNumber : null,
                MobileNumber = privacySettings?.ShowMobileNumber == true ? offer.User.ContactInfo.MobileNumber : null,
                Street = privacySettings?.ShowStreet == true ? offer.User.ContactInfo.Street : null,
                City = privacySettings?.ShowCity == true ? offer.User.ContactInfo.City : null,
                PostalCode = privacySettings?.ShowCity == true ? offer.User.ContactInfo.PostalCode : null
            };
        }

        return new OfferDetailDto
        {
            Id = offer.Id,
            Slug = offer.Slug,
            Title = offer.Title,
            Description = offer.Description,
            PricePerDay = offer.PricePerDay,
            PricePerHour = offer.PricePerHour,
            SalePrice = offer.SalePrice,
            IsService = offer.IsService,
            IsForSale = offer.IsForSale,
            DeliveryAvailable = offer.DeliveryAvailable,
            DeliveryCost = offer.DeliveryCost,
            Deposit = offer.Deposit,
            ImagePath = offer.ImagePath,
            IsActive = offer.IsActive,
            CreatedAt = offer.CreatedAt,
            Category = offer.Category != null ? new CategoryDto
            {
                Id = offer.Category.Id,
                Name = offer.Category.Name,
                Description = offer.Category.Description,
                IconName = offer.Category.IconName
            } : null,
            User = offer.User != null ? new UserDetailDto
            {
                Id = offer.User.Id,
                FirstName = offer.User.FirstName,
                LastName = offer.User.LastName,
                ContactInfo = contactInfo
            } : null,
            Pictures = offer.Pictures?.OrderBy(p => p.DisplayOrder).Select(p => new OfferPictureDto
            {
                Id = p.Id,
                FileName = p.FileName,
                ContentType = p.ContentType,
                FileSize = p.FileSize,
                DisplayOrder = p.DisplayOrder,
                CreatedAt = p.CreatedAt
            }).ToList() ?? new List<OfferPictureDto>()
        };
    }

    [HttpPost("{offerId}/report")]
    [Authorize]
    public async Task<ActionResult> ReportOffer(int offerId, [FromBody] ReportOfferRequest request)
    {
        var userId = GetCurrentUserId();

        var offer = await _offerRepository.GetByIdAsync(offerId);
        if (offer == null)
        {
            return NotFound(new { message = "Angebot nicht gefunden." });
        }

        // Prevent users from reporting their own offers
        if (offer.UserId == userId)
        {
            return BadRequest(new { message = "Sie können Ihr eigenes Angebot nicht melden." });
        }

        var report = new Report
        {
            ReportType = request.ReportType,
            Description = request.Description,
            Status = ReportStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            ReporterId = userId,
            ReportedOfferId = offerId
        };

        await _reportRepository.CreateAsync(report);

        return Ok(new { message = "Angebot erfolgreich gemeldet. Ein Administrator wird Ihre Meldung prüfen." });
    }
}

public class CreateOfferRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal? PricePerDay { get; set; }
    public decimal? PricePerHour { get; set; }
    public decimal? SalePrice { get; set; }
    public bool IsService { get; set; }
    public bool IsForSale { get; set; }
    public bool DeliveryAvailable { get; set; }
    public decimal? DeliveryCost { get; set; }
    public decimal? Deposit { get; set; }
    public int CategoryId { get; set; }
}

public class UpdateOfferRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal? PricePerDay { get; set; }
    public decimal? PricePerHour { get; set; }
    public decimal? SalePrice { get; set; }
    public bool IsService { get; set; }
    public bool IsForSale { get; set; }
    public bool DeliveryAvailable { get; set; }
    public decimal? DeliveryCost { get; set; }
    public decimal? Deposit { get; set; }
    public int CategoryId { get; set; }
    public bool IsActive { get; set; } = true;
}

public class OfferDto
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal? PricePerDay { get; set; }
    public decimal? PricePerHour { get; set; }
    public decimal? SalePrice { get; set; }
    public bool IsService { get; set; }
    public bool IsForSale { get; set; }
    public bool DeliveryAvailable { get; set; }
    public decimal? DeliveryCost { get; set; }
    public decimal? Deposit { get; set; }
    public string? ImagePath { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public CategoryDto? Category { get; set; }
    public UserDto? User { get; set; }
    public OfferPictureDto? FirstPicture { get; set; }
}

public class OfferDetailDto
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal? PricePerDay { get; set; }
    public decimal? PricePerHour { get; set; }
    public decimal? SalePrice { get; set; }
    public bool IsService { get; set; }
    public bool IsForSale { get; set; }
    public bool DeliveryAvailable { get; set; }
    public decimal? DeliveryCost { get; set; }
    public decimal? Deposit { get; set; }
    public string? ImagePath { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public CategoryDto? Category { get; set; }
    public UserDetailDto? User { get; set; }
    public List<OfferPictureDto> Pictures { get; set; } = new List<OfferPictureDto>();
}

public class UserDetailDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public ContactInfoDto? ContactInfo { get; set; }
}

public class ContactInfoDto
{
    public string? PhoneNumber { get; set; }
    public string? MobileNumber { get; set; }
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? PostalCode { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
}

public class OfferPictureDto
{
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UpdatePictureOrderRequest
{
    public int DisplayOrder { get; set; }
}

public class GenerateDescriptionResponse
{
    public string Description { get; set; } = string.Empty;
}

public class ReportOfferRequest
{
    public ReportType ReportType { get; set; }
    public string Description { get; set; } = string.Empty;
}