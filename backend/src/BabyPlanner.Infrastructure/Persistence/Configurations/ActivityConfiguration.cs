using BabyPlanner.Domain.Entities;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BabyPlanner.Infrastructure.Persistence.Configurations;

/// <summary>
/// Maparea entitatii Activity pe tabelul Activities.
/// </summary>
public class ActivityConfiguration : IEntityTypeConfiguration<Activity>
{
    public void Configure(EntityTypeBuilder<Activity> builder)
    {
        builder.ToTable("Activities");

        builder.HasKey(a => a.Id);

        // Enum-ul se salveaza ca numar; valorile sunt explicite in ActivityType.
        builder.Property(a => a.Type)
            .IsRequired()
            .HasConversion<int>();

        // SQLite nu poate sorta sau compara DateTimeOffset in SQL (l-ar stoca drept text
        // cu offset cu tot). Il salvam ca numar de ticks in UTC: comparabil, sortabil si
        // fara ambiguitati. La citire revine ca DateTimeOffset cu offset zero.
        builder.Property(a => a.OccurredAt)
            .IsRequired()
            .HasConversion(
                occurredAt => occurredAt.UtcDateTime.Ticks,
                ticks => new DateTimeOffset(ticks, TimeSpan.Zero));

        builder.Property(a => a.Notes)
            .HasMaxLength(500);

        // Sustine interogarea dashboard-ului: activitatile de azi ale unui bebelus.
        builder.HasIndex(a => new { a.BabyId, a.OccurredAt });
    }
}
