using BabyPlanner.Domain.Entities;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BabyPlanner.Infrastructure.Persistence.Configurations;

/// <summary>
/// Maparea entitatii Baby pe tabelul Babies.
/// </summary>
public class BabyConfiguration : IEntityTypeConfiguration<Baby>
{
    public void Configure(EntityTypeBuilder<Baby> builder)
    {
        builder.ToTable("Babies");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(b => b.DateOfBirth)
            .IsRequired();

        // Un bebelus are multe activitati; stergerea lui le sterge si pe ele.
        builder.HasMany(b => b.Activities)
            .WithOne(a => a.Baby)
            .HasForeignKey(a => a.BabyId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}