using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using DorfkisteBlazor.Infrastructure.Identity;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace DorfkisteBlazor.Server.Controllers;

/// <summary>
/// API Controller for authentication and user management
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IConfiguration configuration,
        ILogger<AuthController> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Register a new user
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return BadRequest("User with this email already exists");
            }

            var user = new ApplicationUser
            {
                UserName = request.Email,
                Email = request.Email,
                
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return BadRequest($"Registration failed: {errors}");
            }

            _logger.LogInformation("User {Email} registered successfully", request.Email);

            var token = await GenerateJwtToken(user);
            return Ok(new AuthResponse
            {
                Token = token,
                User = new UserInfo
                {
                    Id = Guid.Parse(user.Id),
                    Email = user.Email!,
                    Name = user.UserName,
                    Verified = user.EmailConfirmed
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during user registration");
            return StatusCode(500, "An error occurred during registration");
        }
    }

    /// <summary>
    /// Login with email and password
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        try
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                return BadRequest("Invalid email or password");
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: false);
            if (!result.Succeeded)
            {
                _logger.LogWarning("Failed login attempt for user {Email}", request.Email);
                return BadRequest("Invalid email or password");
            }

            _logger.LogInformation("User {Email} logged in successfully", request.Email);

            var token = await GenerateJwtToken(user);
            return Ok(new AuthResponse
            {
                Token = token,
                User = new UserInfo
                {
                    Id = Guid.Parse(user.Id),
                    Email = user.Email!,
                    Name = user.UserName,
                    Verified = user.EmailConfirmed
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during user login");
            return StatusCode(500, "An error occurred during login");
        }
    }

    /// <summary>
    /// Get current user information
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserInfo>> GetCurrentUser()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound("User not found");
            }

            return Ok(new UserInfo
            {
                Id = Guid.Parse(user.Id),
                Email = user.Email!,
                Name = user.UserName,
                Verified = user.EmailConfirmed
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting current user");
            return StatusCode(500, "An error occurred while retrieving user information");
        }
    }

    /// <summary>
    /// Update user profile
    /// </summary>
    [HttpPut("profile")]
    [Authorize]
    public async Task<ActionResult<UserInfo>> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound("User not found");
            }

            user.UserName = request.Name;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return BadRequest($"Profile update failed: {errors}");
            }

            _logger.LogInformation("User {UserId} updated profile", userId);

            return Ok(new UserInfo
            {
                Id = Guid.Parse(user.Id),
                Email = user.Email!,
                Name = user.UserName,
                Verified = user.EmailConfirmed
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating user profile");
            return StatusCode(500, "An error occurred while updating profile");
        }
    }

    /// <summary>
    /// Change user password
    /// </summary>
    [HttpPost("change-password")]
    [Authorize]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound("User not found");
            }

            var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return BadRequest($"Password change failed: {errors}");
            }

            _logger.LogInformation("User {UserId} changed password", userId);
            return Ok("Password changed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while changing password");
            return StatusCode(500, "An error occurred while changing password");
        }
    }

    private async Task<string> GenerateJwtToken(ApplicationUser user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email!),
            new(ClaimTypes.Name, user.UserName ?? user.Email!)
        };

        var roles = await _userManager.GetRolesAsync(user);
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            _configuration["JwtSettings:SecretKey"] ?? "your-secret-key-here"));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["JwtSettings:Issuer"],
            audience: _configuration["JwtSettings:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public class RegisterRequest
{
    public required string Email { get; set; }
    public required string Password { get; set; }
    public string? Name { get; set; }
}

public class LoginRequest
{
    public required string Email { get; set; }
    public required string Password { get; set; }
}

public class UpdateProfileRequest
{
    public string? Name { get; set; }
    public string? Bio { get; set; }
}

public class ChangePasswordRequest
{
    public required string CurrentPassword { get; set; }
    public required string NewPassword { get; set; }
}

public class AuthResponse
{
    public required string Token { get; set; }
    public required UserInfo User { get; set; }
}

public class UserInfo
{
    public Guid Id { get; set; }
    public required string Email { get; set; }
    public string? Name { get; set; }
    public bool Verified { get; set; }
}