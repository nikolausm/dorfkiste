using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace DorfkisteBlazor.Infrastructure.Data.Seeding;

/// <summary>
/// Background service for database seeding during application startup
/// </summary>
public class DatabaseSeedingService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DatabaseSeedingService> _logger;

    public DatabaseSeedingService(
        IServiceProvider serviceProvider,
        ILogger<DatabaseSeedingService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            _logger.LogInformation("Database seeding service starting...");

            using var scope = _serviceProvider.CreateScope();
            var seeder = scope.ServiceProvider.GetRequiredService<DatabaseSeeder>();
            
            await seeder.SeedAsync();
            
            _logger.LogInformation("Database seeding service completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred during database seeding");
            throw;
        }
    }
}

/// <summary>
/// Extensions for configuring database seeding
/// </summary>
public static class DatabaseSeedingExtensions
{
    /// <summary>
    /// Adds database seeding services to the DI container
    /// </summary>
    public static IServiceCollection AddDatabaseSeeding(this IServiceCollection services)
    {
        services.AddScoped<DatabaseSeeder>();
        services.AddHostedService<DatabaseSeedingService>();
        
        return services;
    }

    /// <summary>
    /// Seeds the database manually (useful for development)
    /// </summary>
    public static async Task SeedDatabaseAsync(this IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var seeder = scope.ServiceProvider.GetRequiredService<DatabaseSeeder>();
        await seeder.SeedAsync();
    }
}