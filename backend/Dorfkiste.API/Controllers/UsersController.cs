using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Dorfkiste.Core.Interfaces;
using Dorfkiste.Core.Entities;

namespace Dorfkiste.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _userRepository;

    public UsersController(IUserRepository userRepository)
    {
        _userRepository = userRepository;
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
            } : new ContactInfoDto()
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
            } : new ContactInfoDto()
        });
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim!);
    }
}

public class UserProfileDto
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public ContactInfoDto ContactInfo { get; set; } = new();
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
}