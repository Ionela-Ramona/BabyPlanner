using System.Reflection;

using BabyPlanner.Application.Activities;
using BabyPlanner.Application.Auth;
using BabyPlanner.Application.Babies;
using BabyPlanner.Domain.Entities;

using FluentValidation;

using Microsoft.AspNetCore.Identity;

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
        services.AddScoped<IAuthService, AuthService>();

        // Hash-ul de parola din ASP.NET Identity, fara restul Identity (UserManager, tabele, cookie-uri).
        services.AddSingleton<IPasswordHasher<User>, PasswordHasher<User>>();

        // Descopera automat toti validatorii AbstractValidator din acest assembly.
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        return services;
    }
}
