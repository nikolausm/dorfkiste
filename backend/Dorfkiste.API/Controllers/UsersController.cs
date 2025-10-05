using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Dorfkiste.Core.Interfaces;
using Dorfkiste.Core.Entities;
using Microsoft.Extensions.Logging;

namespace Dorfkiste.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IOfferRepository _offerRepository;
    private readonly IBookingRepository _bookingRepository;
    private readonly IMessageRepository _messageRepository;
    private readonly IEmailService _emailService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(
        IUserRepository userRepository,
        IOfferRepository offerRepository,
        IBookingRepository bookingRepository,
        IMessageRepository messageRepository,
        IEmailService emailService,
        ILogger<UsersController> logger)
    {
        _userRepository = userRepository;
        _offerRepository = offerRepository;
        _bookingRepository = bookingRepository;
        _messageRepository = messageRepository;
        _emailService = emailService;
        _logger = logger;
    }

    [HttpGet("profile")]
    public async Task<ActionResult<UserProfileDto>> GetProfile()
    {
        var userId = GetCurrentUserId();
        var user = await _userRepository.GetByIdAsync(userId);

        if (user == null)
        {
            return NotFound();
        }

        return Ok(new UserProfileDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            ContactInfo = user.ContactInfo != null ? new ContactInfoDto
            {
                PhoneNumber = user.ContactInfo.PhoneNumber,
                MobileNumber = user.ContactInfo.MobileNumber,
                Street = user.ContactInfo.Street,
                City = user.ContactInfo.City,
                PostalCode = user.ContactInfo.PostalCode,
                State = user.ContactInfo.State,
                Country = user.ContactInfo.Country,
            } : new ContactInfoDto(),
            PrivacySettings = user.PrivacySettings != null ? new PrivacySettingsDto
            {
                MarketingEmailsConsent = user.PrivacySettings.MarketingEmailsConsent,
                DataProcessingConsent = user.PrivacySettings.DataProcessingConsent,
                ProfileVisibilityConsent = user.PrivacySettings.ProfileVisibilityConsent,
                DataSharingConsent = user.PrivacySettings.DataSharingConsent,
                ShowPhoneNumber = user.PrivacySettings.ShowPhoneNumber,
                ShowMobileNumber = user.PrivacySettings.ShowMobileNumber,
                ShowStreet = user.PrivacySettings.ShowStreet,
                ShowCity = user.PrivacySettings.ShowCity
            } : null
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PublicUserDto>> GetUserById(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);

        if (user == null || !user.IsActive)
        {
            return NotFound();
        }

        // Return limited public info (no email, contact details)
        return Ok(new PublicUserDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName
        });
    }

    [HttpPut("profile")]
    public async Task<ActionResult<UserProfileDto>> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = GetCurrentUserId();
        var user = await _userRepository.GetByIdAsync(userId);

        if (user == null)
        {
            return NotFound();
        }

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;

        if (user.ContactInfo == null && request.ContactInfo != null)
        {
            user.ContactInfo = new ContactInfo
            {
                UserId = user.Id,
                PhoneNumber = request.ContactInfo.PhoneNumber,
                MobileNumber = request.ContactInfo.MobileNumber,
                Street = request.ContactInfo.Street,
                City = request.ContactInfo.City,
                PostalCode = request.ContactInfo.PostalCode,
                State = request.ContactInfo.State,
                Country = request.ContactInfo.Country
            };
        }
        else if (user.ContactInfo != null)
        {
            user.ContactInfo.PhoneNumber = request.ContactInfo?.PhoneNumber;
            user.ContactInfo.MobileNumber = request.ContactInfo?.MobileNumber;
            user.ContactInfo.Street = request.ContactInfo?.Street;
            user.ContactInfo.City = request.ContactInfo?.City;
            user.ContactInfo.PostalCode = request.ContactInfo?.PostalCode;
            user.ContactInfo.State = request.ContactInfo?.State;
            user.ContactInfo.Country = request.ContactInfo?.Country;
        }

        // Update privacy settings
        if (request.PrivacySettings != null)
        {
            if (user.PrivacySettings == null)
            {
                user.PrivacySettings = new UserPrivacySettings { UserId = user.Id };
            }

            if (request.PrivacySettings.MarketingEmailsConsent.HasValue)
                user.PrivacySettings.MarketingEmailsConsent = request.PrivacySettings.MarketingEmailsConsent.Value;
            if (request.PrivacySettings.ShowPhoneNumber.HasValue)
                user.PrivacySettings.ShowPhoneNumber = request.PrivacySettings.ShowPhoneNumber.Value;
            if (request.PrivacySettings.ShowMobileNumber.HasValue)
                user.PrivacySettings.ShowMobileNumber = request.PrivacySettings.ShowMobileNumber.Value;
            if (request.PrivacySettings.ShowStreet.HasValue)
                user.PrivacySettings.ShowStreet = request.PrivacySettings.ShowStreet.Value;
            if (request.PrivacySettings.ShowCity.HasValue)
                user.PrivacySettings.ShowCity = request.PrivacySettings.ShowCity.Value;
            user.PrivacySettings.UpdatedAt = DateTime.UtcNow;
        }

        await _userRepository.UpdateAsync(user);

        return Ok(new UserProfileDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            ContactInfo = user.ContactInfo != null ? new ContactInfoDto
            {
                PhoneNumber = user.ContactInfo.PhoneNumber,
                MobileNumber = user.ContactInfo.MobileNumber,
                Street = user.ContactInfo.Street,
                City = user.ContactInfo.City,
                PostalCode = user.ContactInfo.PostalCode,
                State = user.ContactInfo.State,
                Country = user.ContactInfo.Country,
            } : new ContactInfoDto(),
            PrivacySettings = user.PrivacySettings != null ? new PrivacySettingsDto
            {
                MarketingEmailsConsent = user.PrivacySettings.MarketingEmailsConsent,
                DataProcessingConsent = user.PrivacySettings.DataProcessingConsent,
                ProfileVisibilityConsent = user.PrivacySettings.ProfileVisibilityConsent,
                DataSharingConsent = user.PrivacySettings.DataSharingConsent,
                ShowPhoneNumber = user.PrivacySettings.ShowPhoneNumber,
                ShowMobileNumber = user.PrivacySettings.ShowMobileNumber,
                ShowStreet = user.PrivacySettings.ShowStreet,
                ShowCity = user.PrivacySettings.ShowCity
            } : null
        });
    }

    [HttpGet("export-data")]
    public async Task<ActionResult> ExportUserData()
    {
        var userId = GetCurrentUserId();
        var user = await _userRepository.GetByIdAsync(userId);

        if (user == null)
        {
            return NotFound(new { message = "Benutzer nicht gefunden." });
        }

        // Collect all user data
        var offers = await _offerRepository.GetByUserIdAsync(userId);
        var customerBookings = await _bookingRepository.GetByCustomerIdAsync(userId);
        var providerBookings = await _bookingRepository.GetByProviderIdAsync(userId);
        var sentMessages = await _messageRepository.GetSentMessagesAsync(userId);
        var receivedMessages = await _messageRepository.GetReceivedMessagesAsync(userId);

        var exportData = new
        {
            ExportDate = DateTime.UtcNow,
            PersonalData = new
            {
                user.Id,
                user.Email,
                user.FirstName,
                user.LastName,
                user.CreatedAt,
                user.LastLoginAt,
                user.EmailVerified,
                ContactInfo = user.ContactInfo != null ? new
                {
                    user.ContactInfo.PhoneNumber,
                    user.ContactInfo.MobileNumber,
                    user.ContactInfo.Street,
                    user.ContactInfo.City,
                    user.ContactInfo.PostalCode,
                    user.ContactInfo.State,
                    user.ContactInfo.Country
                } : null,
                PrivacySettings = user.PrivacySettings != null ? new
                {
                    user.PrivacySettings.MarketingEmailsConsent,
                    user.PrivacySettings.DataProcessingConsent,
                    user.PrivacySettings.ProfileVisibilityConsent,
                    user.PrivacySettings.DataSharingConsent
                } : null
            },
            Offers = offers.Select(o => new
            {
                o.Id,
                o.Title,
                o.Description,
                OfferType = o.IsService ? "service" : "item",
                o.PricePerHour,
                o.CreatedAt,
                o.IsActive,
                Category = o.Category.Name
            }),
            CustomerBookings = customerBookings.Select(b => new
            {
                b.Id,
                OfferTitle = b.Offer.Title,
                b.StartDate,
                b.EndDate,
                b.TotalPrice,
                b.Status,
                b.CreatedAt
            }),
            ProviderBookings = providerBookings.Select(b => new
            {
                b.Id,
                OfferTitle = b.Offer.Title,
                CustomerName = $"{b.Customer.FirstName} {b.Customer.LastName}",
                b.StartDate,
                b.EndDate,
                b.TotalPrice,
                b.Status,
                b.CreatedAt
            }),
            SentMessages = sentMessages.Select(m => new
            {
                m.Id,
                RecipientName = $"{m.Recipient.FirstName} {m.Recipient.LastName}",
                OfferTitle = m.Offer?.Title,
                m.Content,
                m.SentAt
            }),
            ReceivedMessages = receivedMessages.Select(m => new
            {
                m.Id,
                SenderName = $"{m.Sender.FirstName} {m.Sender.LastName}",
                OfferTitle = m.Offer?.Title,
                m.Content,
                m.SentAt
            })
        };

        _logger.LogInformation("User {UserId} exported their data", userId);

        return Ok(exportData);
    }

    [HttpDelete("account")]
    public async Task<ActionResult> DeleteAccount([FromBody] DeleteAccountRequest request)
    {
        var userId = GetCurrentUserId();
        var user = await _userRepository.GetByIdAsync(userId);

        if (user == null)
        {
            return NotFound(new { message = "Benutzer nicht gefunden." });
        }

        // Store email for deletion confirmation
        var userEmail = user.Email;
        var userFirstName = user.FirstName;

        // Mark user as deleted and anonymize data
        user.IsDeleted = true;
        user.DeletedAt = DateTime.UtcNow;
        user.DeletionReason = request.Reason ?? "Benutzer hat die Löschung beantragt";
        user.IsActive = false;
        user.Email = $"deleted_{user.Id}@dorfkiste.local";
        user.FirstName = "Gelöscht";
        user.LastName = "Benutzer";
        user.PasswordHash = string.Empty;
        user.VerificationToken = null;
        user.VerificationTokenExpiry = null;

        // Anonymize contact info
        if (user.ContactInfo != null)
        {
            user.ContactInfo.PhoneNumber = null;
            user.ContactInfo.MobileNumber = null;
            user.ContactInfo.Street = null;
            user.ContactInfo.City = null;
            user.ContactInfo.PostalCode = null;
            user.ContactInfo.State = null;
            user.ContactInfo.Country = null;
        }

        // Anonymize offers
        var offers = await _offerRepository.GetByUserIdAsync(userId);
        foreach (var offer in offers)
        {
            offer.IsActive = false;
            offer.Title = $"[Gelöscht] {offer.Id}";
            offer.Description = "Dieses Angebot wurde vom Benutzer gelöscht.";
            await _offerRepository.UpdateAsync(offer);
        }

        // Anonymize messages
        var sentMessages = await _messageRepository.GetSentMessagesAsync(userId);
        var receivedMessages = await _messageRepository.GetReceivedMessagesAsync(userId);
        foreach (var message in sentMessages.Concat(receivedMessages))
        {
            message.Content = "[Nachricht gelöscht]";
        }

        await _userRepository.UpdateAsync(user);

        // Send deletion confirmation email
        try
        {
            await _emailService.SendAccountDeletionConfirmationAsync(userEmail, userFirstName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send deletion confirmation email to {Email}", userEmail);
        }

        _logger.LogInformation("User {UserId} deleted their account", userId);

        return Ok(new { message = "Ihr Konto wurde erfolgreich gelöscht." });
    }

    [HttpGet("privacy-settings")]
    public async Task<ActionResult<PrivacySettingsDto>> GetPrivacySettings()
    {
        var userId = GetCurrentUserId();
        var user = await _userRepository.GetByIdAsync(userId);

        if (user == null || user.PrivacySettings == null)
        {
            return NotFound();
        }

        return Ok(new PrivacySettingsDto
        {
            MarketingEmailsConsent = user.PrivacySettings.MarketingEmailsConsent,
            DataProcessingConsent = user.PrivacySettings.DataProcessingConsent,
            ProfileVisibilityConsent = user.PrivacySettings.ProfileVisibilityConsent,
            DataSharingConsent = user.PrivacySettings.DataSharingConsent,
            ShowPhoneNumber = user.PrivacySettings.ShowPhoneNumber,
            ShowMobileNumber = user.PrivacySettings.ShowMobileNumber,
            ShowStreet = user.PrivacySettings.ShowStreet,
            ShowCity = user.PrivacySettings.ShowCity
        });
    }

    [HttpPut("privacy-settings")]
    public async Task<ActionResult<PrivacySettingsDto>> UpdatePrivacySettings([FromBody] UpdatePrivacySettingsRequest request)
    {
        var userId = GetCurrentUserId();
        var user = await _userRepository.GetByIdAsync(userId);

        if (user == null)
        {
            return NotFound();
        }

        if (user.PrivacySettings == null)
        {
            user.PrivacySettings = new UserPrivacySettings
            {
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };
        }

        var now = DateTime.UtcNow;

        if (request.MarketingEmailsConsent.HasValue && user.PrivacySettings.MarketingEmailsConsent != request.MarketingEmailsConsent.Value)
        {
            user.PrivacySettings.MarketingEmailsConsent = request.MarketingEmailsConsent.Value;
            user.PrivacySettings.MarketingEmailsConsentDate = now;
        }

        if (request.DataProcessingConsent.HasValue && user.PrivacySettings.DataProcessingConsent != request.DataProcessingConsent.Value)
        {
            user.PrivacySettings.DataProcessingConsent = request.DataProcessingConsent.Value;
            user.PrivacySettings.DataProcessingConsentDate = now;
        }

        if (request.ProfileVisibilityConsent.HasValue && user.PrivacySettings.ProfileVisibilityConsent != request.ProfileVisibilityConsent.Value)
        {
            user.PrivacySettings.ProfileVisibilityConsent = request.ProfileVisibilityConsent.Value;
            user.PrivacySettings.ProfileVisibilityConsentDate = now;
        }

        if (request.DataSharingConsent.HasValue && user.PrivacySettings.DataSharingConsent != request.DataSharingConsent.Value)
        {
            user.PrivacySettings.DataSharingConsent = request.DataSharingConsent.Value;
            user.PrivacySettings.DataSharingConsentDate = now;
        }

        // Contact information visibility settings
        if (request.ShowPhoneNumber.HasValue)
        {
            user.PrivacySettings.ShowPhoneNumber = request.ShowPhoneNumber.Value;
        }

        if (request.ShowMobileNumber.HasValue)
        {
            user.PrivacySettings.ShowMobileNumber = request.ShowMobileNumber.Value;
        }

        if (request.ShowStreet.HasValue)
        {
            user.PrivacySettings.ShowStreet = request.ShowStreet.Value;
        }

        if (request.ShowCity.HasValue)
        {
            user.PrivacySettings.ShowCity = request.ShowCity.Value;
        }

        user.PrivacySettings.UpdatedAt = now;
        await _userRepository.UpdateAsync(user);

        return Ok(new PrivacySettingsDto
        {
            MarketingEmailsConsent = user.PrivacySettings.MarketingEmailsConsent,
            DataProcessingConsent = user.PrivacySettings.DataProcessingConsent,
            ProfileVisibilityConsent = user.PrivacySettings.ProfileVisibilityConsent,
            DataSharingConsent = user.PrivacySettings.DataSharingConsent,
            ShowPhoneNumber = user.PrivacySettings.ShowPhoneNumber,
            ShowMobileNumber = user.PrivacySettings.ShowMobileNumber,
            ShowStreet = user.PrivacySettings.ShowStreet,
            ShowCity = user.PrivacySettings.ShowCity
        });
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim!);
    }
}

public class DeleteAccountRequest
{
    public string? Reason { get; set; }
}

public class PrivacySettingsDto
{
    public bool? MarketingEmailsConsent { get; set; }
    public bool? DataProcessingConsent { get; set; }
    public bool? ProfileVisibilityConsent { get; set; }
    public bool? DataSharingConsent { get; set; }
    public bool? ShowPhoneNumber { get; set; }
    public bool? ShowMobileNumber { get; set; }
    public bool? ShowStreet { get; set; }
    public bool? ShowCity { get; set; }
}

public class UpdatePrivacySettingsRequest
{
    public bool? MarketingEmailsConsent { get; set; }
    public bool? DataProcessingConsent { get; set; }
    public bool? ProfileVisibilityConsent { get; set; }
    public bool? DataSharingConsent { get; set; }
    public bool? ShowPhoneNumber { get; set; }
    public bool? ShowMobileNumber { get; set; }
    public bool? ShowStreet { get; set; }
    public bool? ShowCity { get; set; }
}

public class UserProfileDto
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public ContactInfoDto ContactInfo { get; set; } = new();
    public PrivacySettingsDto? PrivacySettings { get; set; }
}

public class PublicUserDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
}

public class UpdateProfileRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public ContactInfoDto? ContactInfo { get; set; }
    public PrivacySettingsDto? PrivacySettings { get; set; }
}