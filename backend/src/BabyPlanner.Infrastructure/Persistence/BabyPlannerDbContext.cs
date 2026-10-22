using System.Reflection;

using BabyPlanner.Application.Common.Interfaces;
using BabyPlanner.Domain.Entities;

using Microsoft.EntityFrameworkCore;

namespace BabyPlanner.Infrastructure.Persistence;

/// <summary>
/// Contextul EF Core pentru baza de date BabyPlanner.
/// Optiunile (inclusiv connection string-ul) vin din exterior, prin DI.
/// </summary>
public class BabyPlannerDbContext : DbContext
{
    private readonly ICurrentUser _currentUser;

    public BabyPlannerDbContext(DbContextOptions<BabyPlannerDbContext> options, ICurrentUser currentUser)
        : base(options)
    {
        _currentUser = currentUser;
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Baby> Babies => Set<Baby>();

    public DbSet<Activity> Activities => Set<Activity>();

    /// <summary>
    /// Proprietate a contextului, nu o valoare copiata: EF o citeste din nou la fiecare
    /// interogare, deci acelasi model compilat serveste fiecare parinte.
    /// </summary>
    private int? CurrentUserId => _currentUser.UserId;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Descopera automat toate clasele IEntityTypeConfiguration din acest assembly.
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Fiecare parinte vede doar bebelusii lui. Un singur filtru, aici, in loc de un
        // "Where(UserId == ...)" in fiecare metoda de repository, unde ar fi usor de uitat.
        // Fara utilizator (CurrentUserId null) nu se vede niciun bebelus.
        modelBuilder.Entity<Baby>().HasQueryFilter(b => b.UserId == CurrentUserId);

        // Si activitatile, prin bebelusul lor. ActivityService verifica oricum intai
        // bebelusul, dar asa nici o interogare noua care uita verificarea nu scapa date.
        modelBuilder.Entity<Activity>().HasQueryFilter(a => a.Baby!.UserId == CurrentUserId);

        base.OnModelCreating(modelBuilder);
    }
}
