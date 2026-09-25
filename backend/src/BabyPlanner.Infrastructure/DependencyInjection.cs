using BabyPlanner.Application.Common.Interfaces;
using BabyPlanner.Infrastructure.Persistence;
using BabyPlanner.Infrastructure.Persistence.Repositories;
using BabyPlanner.Infrastructure.Services;

using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BabyPlanner.Infrastructure;

/// <summary>
/// Inregistrarea serviciilor din stratul Infrastructure in containerul de DI.
/// </summary>
public static class DependencyInjection
{
    private const string ConnectionStringName = "BabyPlannerDb";

    /// <summary>
    /// Adauga contextul EF Core, providerul de baza de date si implementarile
    /// concrete ale interfetelor definite in Application.
    /// Astfel, stratul Api nu depinde direct de providerul folosit.
    /// </summary>
    /// <param name="basePath">
    /// Directorul fata de care se rezolva caile relative din connection string
    /// (de regula content root-ul aplicatiei).
    /// </param>
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration,
        string basePath)
    {
        var connectionString = configuration.GetConnectionString(ConnectionStringName)
            ?? throw new InvalidOperationException(
                $"Lipseste connection string-ul '{ConnectionStringName}' din configuratie.");

        services.AddDbContext<BabyPlannerDbContext>(options =>
            options.UseSqlite(ResolveSqlitePath(connectionString, basePath)));

        // Repository-urile traiesc cat o cerere HTTP, la fel ca DbContext-ul pe care il folosesc.
        services.AddScoped<IBabyRepository, BabyRepository>();
        services.AddScoped<IActivityRepository, ActivityRepository>();

        // Sursa de timp nu are stare, deci o singura instanta e suficienta.
        services.AddSingleton<IDateTimeProvider, SystemDateTimeProvider>();

        return services;
    }

    /// <summary>
    /// Transforma o cale relativa din "Data Source" intr-una absoluta, raportata la
    /// <paramref name="basePath"/>, si creeaza directorul daca lipseste.
    /// Fara asta, baza s-ar crea in directorul curent al procesului, deci "dotnet run"
    /// si "dotnet ef" ar putea ajunge pe fisiere diferite.
    /// </summary>
    private static string ResolveSqlitePath(string connectionString, string basePath)
    {
        var builder = new SqliteConnectionStringBuilder(connectionString);

        // Bazele in-memory nu au corespondent pe disc.
        if (string.IsNullOrWhiteSpace(builder.DataSource)
            || builder.Mode == SqliteOpenMode.Memory
            || builder.DataSource == ":memory:")
        {
            return connectionString;
        }

        if (Path.IsPathRooted(builder.DataSource))
        {
            return connectionString;
        }

        var fullPath = Path.GetFullPath(Path.Combine(basePath, builder.DataSource));
        Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);

        builder.DataSource = fullPath;
        return builder.ConnectionString;
    }
}
