using System.Reflection;

using BabyPlanner.Domain.Entities;

using Microsoft.EntityFrameworkCore;

namespace BabyPlanner.Infrastructure.Persistence;

/// <summary>
/// Contextul EF Core pentru baza de date BabyPlanner.
/// Optiunile (inclusiv connection string-ul) vin din exterior, prin DI.
/// </summary>
public class BabyPlannerDbContext : DbContext
{
    public BabyPlannerDbContext(DbContextOptions<BabyPlannerDbContext> options)
        : base(options)
    {
    }

    public DbSet<Baby> Babies => Set<Baby>();

    public DbSet<Activity> Activities => Set<Activity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Descopera automat toate clasele IEntityTypeConfiguration din acest assembly.
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        base.OnModelCreating(modelBuilder);
    }
}