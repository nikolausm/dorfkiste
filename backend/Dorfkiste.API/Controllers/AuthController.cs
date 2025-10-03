using Microsoft.AspNetCore.Mvc;
using Dorfkiste.Core.Interfaces;

namespace Dorfkiste.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var user = await _authService.RegisterUserAsync(
                request.Email,
                request.Password,
                request.FirstName,
                request.LastName
            );

            var token = await _authService.GenerateJwtTokenAsync(user);

            return Ok(new AuthResponse
            {
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName
                }
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _authService.ValidateUserAsync(request.Email, request.Password);

        if (user == null)
        {
            return Unauthorized(new { message = "Ungültige E-Mail-Adresse oder Passwort." });
        }

        var token = await _authService.GenerateJwtTokenAsync(user);

        return Ok(new AuthResponse
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                EmailVerified = user.EmailVerified
            }
        });
    }

    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
    {
        var success = await _authService.VerifyEmailAsync(request.Token);

        if (!success)
        {
            return BadRequest(new { message = "Ungültiger oder abgelaufener Verifizierungstoken." });
        }

        return Ok(new { message = "E-Mail-Adresse erfolgreich bestätigt." });
    }

    [HttpPost("resend-verification")]
    public async Task<IActionResult> ResendVerification([FromBody] ResendVerificationRequest request)
    {
        var success = await _authService.ResendVerificationEmailAsync(request.Email);

        if (!success)
        {
            return BadRequest(new { message = "E-Mail-Adresse nicht gefunden oder bereits bestätigt." });
        }

        return Ok(new { message = "Verifizierungs-E-Mail wurde erneut gesendet." });
    }
}

public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public UserDto User { get; set; } = new();
}

public class UserDto
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public bool EmailVerified { get; set; }
}

public class VerifyEmailRequest
{
    public string Token { get; set; } = string.Empty;
}

public class ResendVerificationRequest
{
    public string Email { get; set; } = string.Empty;
}