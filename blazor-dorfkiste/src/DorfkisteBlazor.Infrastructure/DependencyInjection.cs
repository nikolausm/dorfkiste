using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
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
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            
            // Check if connection string contains SQLite format (starts with "Data Source=")
            if (connectionString?.StartsWith("Data Source=") == true)
            {
                // Use SQLite
                options.UseSqlite(connectionString,
                    b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName));
            }
            else
            {
                // Use SQL Server for other connection strings
                options.UseSqlServer(connectionString,
                    b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName));
            }
        });

        // Configure Identity
        services.AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
        {
            // Password settings
            options.Password.RequireDigit = true;
            options.Password.RequiredLength = 6;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequireUppercase = true;
            options.Password.RequireLowercase = true;
            
            // User settings
            options.User.RequireUniqueEmail = true;
            
            // SignIn settings
            options.SignIn.RequireConfirmedEmail = false;
            options.SignIn.RequireConfirmedAccount = false;
        })
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddDefaultTokenProviders();

        // Register repositories
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IUnitOfWork, Data.UnitOfWork>();
        
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