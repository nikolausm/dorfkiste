using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using DorfkisteBlazor.Domain.Interfaces;
using DorfkisteBlazor.Infrastructure.Data;
using DorfkisteBlazor.Infrastructure.Identity;
using DorfkisteBlazor.Infrastructure.Repositories;
using DorfkisteBlazor.Infrastructure.Data.Seeding;
using DorfkisteBlazor.Infrastructure.Health;

namespace DorfkisteBlazor.Infrastructure;

/// <summary>
/// Dependency injection configuration for Infrastructure layer
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Configure Entity Framework
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

        // Identity and cookie configuration is typically done in the Web (Server) project.
        // Keeping Infrastructure free of ASP.NET Core UI-specific registrations avoids referencing the shared framework here.

        // Register repositories
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        
        // Register specialized repositories
        services.AddScoped<IItemRepository, ItemRepository>();
        services.AddScoped<IRentalRepository, RentalRepository>();
        services.AddScoped<IUserRepository, UserRepository>();

        // Register database seeding services
        services.AddDatabaseSeeding();

        // Register health checks
        services.AddDorfkisteHealthChecks();

        // Register infrastructure services
        // Example: services.AddScoped<IEmailService, EmailService>();
        // Example: services.AddScoped<IStorageService, AzureStorageService>();

        // Add distributed cache (Redis)
        var redisConnection = configuration.GetConnectionString("Redis");
        if (!string.IsNullOrEmpty(redisConnection))
        {
            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = redisConnection;
                options.InstanceName = "DorfkisteBlazor";
            });
        }
        else
        {
            // Use in-memory cache as fallback
            services.AddDistributedMemoryCache();
        }

        return services;
    }
}