using Dorfkiste.Core.Entities;

namespace Dorfkiste.Core.Interfaces;

public interface IAuthService
{
    Task<string> GenerateJwtTokenAsync(User user);
    Task<User?> ValidateUserAsync(string email, string password);
    Task<User> RegisterUserAsync(string email, string password, string firstName, string lastName);
    string HashPassword(string password);
    bool VerifyPassword(string password, string hashedPassword);
}