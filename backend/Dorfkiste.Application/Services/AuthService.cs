using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using BCrypt.Net;
using Dorfkiste.Core.Entities;
using Dorfkiste.Core.Interfaces;

namespace Dorfkiste.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IEmailService _emailService;
    private readonly string _jwtSecret;
    private readonly string _jwtIssuer;

    public AuthService(IUserRepository userRepository, IEmailService emailService, string jwtSecret, string jwtIssuer)
    {
        _userRepository = userRepository;
        _emailService = emailService;
        _jwtSecret = jwtSecret;
        _jwtIssuer = jwtIssuer;
    }

    public Task<string> GenerateJwtTokenAsync(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_jwtSecret);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
            new("IsAdmin", user.IsAdmin.ToString())
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7),
            Issuer = _jwtIssuer,
            Audience = _jwtIssuer,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), 
                SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return Task.FromResult(tokenHandler.WriteToken(token));
    }

    public async Task<User?> ValidateUserAsync(string email, string password)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        
        if (user == null || !user.IsActive)
            return null;

        if (!VerifyPassword(password, user.PasswordHash))
            return null;

        user.LastLoginAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);

        return user;
    }

    public async Task<User> RegisterUserAsync(string email, string password, string firstName, string lastName)
    {
        if (await _userRepository.ExistsAsync(email))
            throw new InvalidOperationException("Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.");

        var verificationToken = GenerateVerificationToken();

        var user = new User
        {
            Email = email.ToLowerInvariant(),
            PasswordHash = HashPassword(password),
            FirstName = firstName,
            LastName = lastName,
            CreatedAt = DateTime.UtcNow,
            IsActive = true,
            EmailVerified = false,
            VerificationToken = verificationToken,
            VerificationTokenExpiry = DateTime.UtcNow.AddHours(24),
            ContactInfo = new ContactInfo(),
            PrivacySettings = new UserPrivacySettings
            {
                DataProcessingConsent = true,
                DataProcessingConsentDate = DateTime.UtcNow,
                MarketingEmailsConsent = false,
                ShowPhoneNumber = false,
                ShowMobileNumber = false,
                ShowStreet = false,
                ShowCity = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };

        var createdUser = await _userRepository.CreateAsync(user);

        // Send verification email
        try
        {
            await _emailService.SendVerificationEmailAsync(user.Email, user.FirstName, verificationToken);
        }
        catch (Exception)
        {
            // Log error but don't fail registration
        }

        return createdUser;
    }

    public async Task<bool> VerifyEmailAsync(string token)
    {
        var users = await _userRepository.GetAllAsync();
        var user = users.FirstOrDefault(u => u.VerificationToken == token);

        if (user == null)
            return false;

        if (user.EmailVerified)
            return true;

        if (user.VerificationTokenExpiry == null || user.VerificationTokenExpiry < DateTime.UtcNow)
            return false;

        user.EmailVerified = true;
        user.VerificationToken = null;
        user.VerificationTokenExpiry = null;

        await _userRepository.UpdateAsync(user);

        // Send welcome email
        try
        {
            await _emailService.SendWelcomeEmailAsync(user.Email, user.FirstName);
        }
        catch (Exception)
        {
            // Log error but don't fail verification
        }

        return true;
    }

    public async Task<bool> ResendVerificationEmailAsync(string email)
    {
        var user = await _userRepository.GetByEmailAsync(email);

        if (user == null || user.EmailVerified)
            return false;

        var verificationToken = GenerateVerificationToken();
        user.VerificationToken = verificationToken;
        user.VerificationTokenExpiry = DateTime.UtcNow.AddHours(24);

        await _userRepository.UpdateAsync(user);

        try
        {
            await _emailService.SendVerificationEmailAsync(user.Email, user.FirstName, verificationToken);
            return true;
        }
        catch (Exception)
        {
            return false;
        }
    }

    public string GenerateVerificationToken()
    {
        var randomBytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes).Replace("+", "-").Replace("/", "_").Replace("=", "");
    }

    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, BCrypt.Net.BCrypt.GenerateSalt(12));
    }

    public bool VerifyPassword(string password, string hashedPassword)
    {
        try
        {
            return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
        }
        catch
        {
            return false;
        }
    }
}