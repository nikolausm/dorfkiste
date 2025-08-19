using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using FluentValidation;

namespace DorfkisteBlazor.Application;

/// <summary>
/// Dependency injection configuration for Application layer
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Register AutoMapper
        services.AddAutoMapper(Assembly.GetExecutingAssembly());

        // Register MediatR
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
            cfg.AddOpenBehavior(typeof(Common.Behaviors.ValidationBehavior<,>));
            cfg.AddOpenBehavior(typeof(Common.Behaviors.LoggingBehavior<,>));
            cfg.AddOpenBehavior(typeof(Common.Behaviors.PerformanceBehavior<,>));
        });

        // Register FluentValidation validators
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        // Register application services
        // Example: services.AddScoped<IProductService, ProductService>();

        return services;
    }
}