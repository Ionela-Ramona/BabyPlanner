using System.Reflection;

using BabyPlanner.Application.Activities;
using BabyPlanner.Application.Babies;

using FluentValidation;

using Microsoft.Extensions.DependencyInjection;

namespace BabyPlanner.Application;

/// <summary>
/// Inregistrarea serviciilor din stratul Application in containerul de DI.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IBabyService, BabyService>();
        services.AddScoped<IActivityService, ActivityService>();

        // Descopera automat toti validatorii AbstractValidator din acest assembly.
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        return services;
    }
}
