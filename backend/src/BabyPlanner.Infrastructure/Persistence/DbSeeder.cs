using BabyPlanner.Application.Common.Interfaces;
using BabyPlanner.Domain.Entities;
using BabyPlanner.Domain.Enums;

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace BabyPlanner.Infrastructure.Persistence;

/// <summary>
/// Populeaza baza cu un set minim de date, ca dupa un "git clone" sa ai imediat ce
/// vedea in Swagger si in aplicatia Angular.
/// Ruleaza doar daca baza e goala, deci poate fi apelat la fiecare pornire.
/// </summary>
public static class DbSeeder
{
    /// <summary>Contul demo din Development. Aceleasi date le foloseste si migrarea AddUsers.</summary>
    public const string DemoEmail = "demo@babyplanner.local";

    public const string DemoPassword = "BabyPlanner1";

    /// <returns><c>true</c> daca datele au fost adaugate acum, <c>false</c> daca baza avea deja continut.</returns>
    public static async Task<bool> SeedAsync(
        BabyPlannerDbContext context,
        IDateTimeProvider dateTimeProvider,
        IPasswordHasher<User> passwordHasher,
        CancellationToken cancellationToken = default)
    {
        // Orice cont sau bebelus existent inseamna ca cineva a lucrat deja cu baza; nu ne
        // atingem de ea. IgnoreQueryFilters: la pornire nu e nimeni logat, deci filtrul
        // de proprietar ar ascunde toti bebelusii si am popula baza la fiecare pornire.
        if (await context.Users.AnyAsync(cancellationToken)
            || await context.Babies.IgnoreQueryFilters().AnyAsync(cancellationToken))
        {
            return false;
        }

        var now = dateTimeProvider.Now;

        var user = new User { Email = DemoEmail, PasswordHash = "" };
        user.PasswordHash = passwordHasher.HashPassword(user, DemoPassword);

        var baby = new Baby
        {
            Name = "Maria",
            DateOfBirth = DateOnly.FromDateTime(now.Date).AddMonths(-6),

            // Timpii sunt relativi la "acum", nu ore fixe: asa nicio activitate nu ajunge
            // in viitor, indiferent de ora la care pornesti aplicatia.
            // Detaliile (ml, minute, tip de scutec) sunt campuri, nu text in notite: asa
            // Azi poate arata totaluri ("120 ml azi", "Somn · 45 min"). Ultimul somn
            // inca dureaza, ca sa se vada "Inca doarme" si butonul "S-a trezit".
            Activities =
            {
                new Activity
                {
                    Type = ActivityType.Sleep,
                    OccurredAt = now.AddMinutes(-10),
                    InProgress = true
                },
                new Activity
                {
                    Type = ActivityType.Feeding,
                    OccurredAt = now.AddMinutes(-20),
                    Notes = "Lapte praf",
                    AmountMl = 120
                },
                new Activity
                {
                    Type = ActivityType.Diaper,
                    OccurredAt = now.AddHours(-2),
                    Notes = "Schimbat, fara probleme",
                    DiaperKind = DiaperKind.Wet
                },
                new Activity
                {
                    Type = ActivityType.Sleep,
                    OccurredAt = now.AddHours(-4),
                    Notes = "In patut",
                    DurationMinutes = 45
                },
                new Activity
                {
                    Type = ActivityType.Feeding,
                    OccurredAt = now.AddHours(-6),
                    Notes = "Alaptat",
                    DurationMinutes = 15
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
        // Si UserId: EF salveaza intai contul, apoi il completeaza singur din colectia Babies.
        user.Babies.Add(baby);
        await context.Users.AddAsync(user, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
