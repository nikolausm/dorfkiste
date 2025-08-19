using DorfkisteBlazor.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace DorfkisteBlazor.Server.Tests.TestFixtures;

/// <summary>
/// Custom web application factory for integration testing with in-memory database
/// </summary>
public class CustomWebApplicationFactory<TStartup> : WebApplicationFactory<TStartup> where TStartup : class
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove the existing ApplicationDbContext registration
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
            if (descriptor != null)
            {
                services.Remove(descriptor);
            }

            // Add ApplicationDbContext using an in-memory database for testing
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseInMemoryDatabase("InMemoryDbForTesting");
            });

            // Build the service provider
            var sp = services.BuildServiceProvider();

            // Create a scope to obtain a reference to the database context (ApplicationDbContext)
            using var scope = sp.CreateScope();
            var scopedServices = scope.ServiceProvider;
            var db = scopedServices.GetRequiredService<ApplicationDbContext>();
            var logger = scopedServices.GetRequiredService<ILogger<CustomWebApplicationFactory<TStartup>>>();

            // Ensure the database is created
            db.Database.EnsureCreated();

            try
            {
                // Seed the database with test data
                SeedTestData(db);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred seeding the database with test messages. Error: {Message}", ex.Message);
            }
        });

        builder.UseEnvironment("Testing");
    }

    private static void SeedTestData(ApplicationDbContext context)
    {
        // Clear existing data
        context.Items.RemoveRange(context.Items);
        context.Users.RemoveRange(context.Users);
        context.Categories.RemoveRange(context.Categories);
        context.Rentals.RemoveRange(context.Rentals);
        context.SaveChanges();

        // Seed test data
        var testUserId = Guid.NewGuid();
        var testCategoryId = Guid.NewGuid();

        var testUser = new DorfkisteBlazor.Domain.Entities.User
        {
            Id = testUserId,
            Email = "test@example.com",
            Name = "Test User",
            Verified = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var testCategory = new DorfkisteBlazor.Domain.Entities.Category
        {
            Id = testCategoryId,
            Name = "Test Category",
            Slug = "test-category",
            Description = "Test category for integration tests",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var testItem = new DorfkisteBlazor.Domain.Entities.Item
        {
            Id = Guid.NewGuid(),
            Title = "Test Item",
            Description = "Test item for integration tests",
            Condition = "neu",
            PricePerDay = 25.00m,
            PricePerHour = 5.00m,
            Deposit = 100.00m,
            Available = true,
            Location = "Test Location",
            DeliveryAvailable = true,
            DeliveryFee = 10.00m,
            PickupAvailable = true,
            UserId = testUserId,
            CategoryId = testCategoryId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Users.Add(testUser);
        context.Categories.Add(testCategory);
        context.Items.Add(testItem);
        context.SaveChanges();
    }
}

/// <summary>
/// Authorization test helper for creating JWT tokens
/// </summary>
public static class AuthorizationHelper
{
    public static string CreateTestJwtToken(string userId = null, string email = "test@example.com", bool isAdmin = false)
    {
        // This would normally use your JWT service to create a test token
        // For now, return a mock token string
        return "test-jwt-token";
    }

    public static void AddJwtToken(HttpClient client, string token = null)
    {
        token ??= CreateTestJwtToken();
        client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
    }
}