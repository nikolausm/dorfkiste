using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;
using DorfkisteBlazor.Infrastructure.Data;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;

namespace DorfkisteBlazor.Infrastructure.Health;

/// <summary>
/// Health check for database connectivity and basic operations
/// </summary>
public class DatabaseHealthCheck : IHealthCheck
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DatabaseHealthCheck> _logger;

    public DatabaseHealthCheck(ApplicationDbContext context, ILogger<DatabaseHealthCheck> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogDebug("Starting database health check");

            // Test basic connectivity
            var canConnect = await _context.Database.CanConnectAsync(cancellationToken);
            if (!canConnect)
            {
                _logger.LogWarning("Database health check failed: Cannot connect to database");
                return HealthCheckResult.Unhealthy("Cannot connect to database");
            }

            // Test a simple query
            var userCount = await _context.Users.CountAsync(cancellationToken);
            var categoryCount = await _context.Categories.CountAsync(cancellationToken);

            // Check for pending migrations (optional warning)
            var pendingMigrations = await _context.Database.GetPendingMigrationsAsync(cancellationToken);
            
            var healthData = new Dictionary<string, object>
            {
                ["UserCount"] = userCount,
                ["CategoryCount"] = categoryCount,
                ["PendingMigrations"] = pendingMigrations.Count(),
                ["DatabaseProvider"] = _context.Database.ProviderName ?? "Unknown",
                ["ConnectionString"] = _context.Database.GetConnectionString()?.Substring(0, 50) + "..." ?? "Not configured"
            };

            if (pendingMigrations.Any())
            {
                _logger.LogWarning("Database health check warning: {Count} pending migrations found", pendingMigrations.Count());
                return HealthCheckResult.Degraded(
                    $"Database is accessible but has {pendingMigrations.Count()} pending migrations",
                    data: healthData);
            }

            _logger.LogDebug("Database health check completed successfully");
            return HealthCheckResult.Healthy("Database is accessible and responsive", healthData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database health check failed");
            return HealthCheckResult.Unhealthy("Database health check failed", ex);
        }
    }
}

/// <summary>
/// Health check for Redis cache connectivity
/// </summary>
public class RedisHealthCheck : IHealthCheck
{
    private readonly ILogger<RedisHealthCheck> _logger;
    // Note: Implement Redis connection logic when Redis is configured

    public RedisHealthCheck(ILogger<RedisHealthCheck> logger)
    {
        _logger = logger;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // TODO: Implement Redis connectivity check when Redis is configured
            // For now, return healthy if no Redis configuration exists
            await Task.Delay(10, cancellationToken); // Simulate async operation
            
            return HealthCheckResult.Healthy("Redis check not implemented yet");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Redis health check failed");
            return HealthCheckResult.Unhealthy("Redis health check failed", ex);
        }
    }
}

/// <summary>
/// Extensions for registering health checks
/// </summary>
public static class HealthCheckExtensions
{
    /// <summary>
    /// Adds database and infrastructure health checks
    /// </summary>
    public static IServiceCollection AddDorfkisteHealthChecks(this IServiceCollection services)
    {
        services.AddHealthChecks()
            .AddCheck<DatabaseHealthCheck>("database", 
                failureStatus: HealthStatus.Unhealthy, 
                tags: new[] { "ready", "database" })
            .AddCheck<RedisHealthCheck>("redis", 
                failureStatus: HealthStatus.Degraded, 
                tags: new[] { "ready", "cache" });

        return services;
    }
}