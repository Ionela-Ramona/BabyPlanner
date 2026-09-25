using BabyPlanner.Application.Common.Interfaces;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace BabyPlanner.Infrastructure.Persistence;

/// <summary>
/// Aduce baza de date la zi la pornirea aplicatiei si o populeaza cu date minime.
/// Infrastructure ofera doar capabilitatea; stratul Api decide CAND o foloseste —
/// in productie migrarile se aplica deliberat, ca pas separat de deploy, nu la pornire.
/// </summary>
public static class DatabaseInitializer
{
    public static async Task InitializeDatabaseAsync(
        this IServiceProvider services,
        CancellationToken cancellationToken = default)
    {
        // DbContext-ul e inregistrat Scoped, iar la pornire nu exista o cerere HTTP
        // care sa deschida un scope — asa ca ne cream noi unul.
        using var scope = services.CreateScope();
        var provider = scope.ServiceProvider;

        var logger = provider.GetRequiredService<ILoggerFactory>()
            .CreateLogger(typeof(DatabaseInitializer));

        var context = provider.GetRequiredService<BabyPlannerDbContext>();

        try
        {
            var pending = (await context.Database.GetPendingMigrationsAsync(cancellationToken)).ToList();

            if (pending.Count > 0)
            {
                logger.LogInformation(
                    "Se aplica {Count} migrare/migrari: {Migrations}", pending.Count, string.Join(", ", pending));

                // Echivalentul lui "dotnet ef database update", rulat automat.
                // Creeaza si fisierul .db daca lipseste.
                await context.Database.MigrateAsync(cancellationToken);
            }

            var seeded = await DbSeeder.SeedAsync(
                context, provider.GetRequiredService<IDateTimeProvider>(), cancellationToken);

            logger.LogInformation(
                seeded
                    ? "Baza de date era goala; am adaugat datele de test."
                    : "Baza de date contine deja date; seed-ul a fost sarit.");
        }
        catch (Exception ex)
        {
            // Daca baza nu poate fi initializata, e mai bine sa oprim pornirea decat sa
            // primim erori 500 la fiecare cerere.
            logger.LogError(ex, "Initializarea bazei de date a esuat.");
            throw;
        }
    }
}
