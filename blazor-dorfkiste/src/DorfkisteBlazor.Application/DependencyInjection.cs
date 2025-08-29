using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using FluentValidation;
using DorfkisteBlazor.Application.Common.Interfaces;

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

        // Register all Query and Command handlers
        var assembly = Assembly.GetExecutingAssembly();
        
        // Find all handler types
        var handlerTypes = assembly.GetTypes()
            .Where(t => t.IsClass && !t.IsAbstract && !t.IsGenericType)
            .Where(t => t.GetInterfaces().Any(i => 
                i.IsGenericType && 
                (i.GetGenericTypeDefinition() == typeof(IQueryHandler<,>) ||
                 i.GetGenericTypeDefinition() == typeof(ICommandHandler<,>))))
            .ToList();

        // Register each handler
        foreach (var handlerType in handlerTypes)
        {
            var interfaces = handlerType.GetInterfaces()
                .Where(i => i.IsGenericType && 
                    (i.GetGenericTypeDefinition() == typeof(IQueryHandler<,>) ||
                     i.GetGenericTypeDefinition() == typeof(ICommandHandler<,>)));
            
            foreach (var interfaceType in interfaces)
            {
                services.AddScoped(interfaceType, handlerType);
            }
        }

        // Register application services
        // Example: services.AddScoped<IProductService, ProductService>();

        return services;
    }
}