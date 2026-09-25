using BabyPlanner.Application.Common.Interfaces;
using BabyPlanner.Domain.Entities;
using BabyPlanner.Domain.Enums;

using Microsoft.EntityFrameworkCore;

namespace BabyPlanner.Infrastructure.Persistence;

/// <summary>
/// Populeaza baza cu un set minim de date, ca dupa un "git clone" sa ai imediat ce
/// vedea in Swagger si in aplicatia Angular.
/// Ruleaza doar daca baza e goala, deci poate fi apelat la fiecare pornire.
/// </summary>
public static class DbSeeder
{
    /// <returns><c>true</c> daca datele au fost adaugate acum, <c>false</c> daca baza avea deja continut.</returns>
    public static async Task<bool> SeedAsync(
        BabyPlannerDbContext context,
        IDateTimeProvider dateTimeProvider,
        CancellationToken cancellationToken = default)
    {
        // Orice bebelus existent inseamna ca cineva a lucrat deja cu baza; nu ne atingem de ea.
        if (await context.Babies.AnyAsync(cancellationToken))
        {
            return false;
        }

        var now = dateTimeProvider.Now;

        var baby = new Baby
        {
            Name = "Maria",
            DateOfBirth = DateOnly.FromDateTime(now.Date).AddMonths(-6),

            // Timpii sunt relativi la "acum", nu ore fixe: asa nicio activitate nu ajunge
            // in viitor, indiferent de ora la care pornesti aplicatia.
            Activities =
            {
                new Activity
                {
                    Type = ActivityType.Feeding,
                    OccurredAt = now.AddMinutes(-20),
                    Notes = "120 ml lapte praf"
                },
                new Activity
                {
                    Type = ActivityType.Diaper,
                    OccurredAt = now.AddHours(-2),
                    Notes = "Schimbat, fara probleme"
                },
                new Activity
                {
                    Type = ActivityType.Sleep,
                    OccurredAt = now.AddHours(-4),
                    Notes = "A dormit 45 de minute"
                },
                new Activity
                {
                    Type = ActivityType.Feeding,
                    OccurredAt = now.AddHours(-6),
                    Notes = "Alaptat 15 minute"
                },

                // Deliberat de ieri: asa vezi ca endpoint-ul /today chiar filtreaza ceva.
                new Activity
                {
                    Type = ActivityType.Medicine,
                    OccurredAt = now.AddDays(-1).AddHours(-1),
                    Notes = "Vitamina D, o picatura"
                }
            }
        };

        // Activitatile se salveaza odata cu bebelusul: EF completeaza singur BabyId din navigare.
        await context.Babies.AddAsync(baby, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
