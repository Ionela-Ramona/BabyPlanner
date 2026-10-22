using BabyPlanner.Domain.Entities;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BabyPlanner.Infrastructure.Persistence.Configurations;

/// <summary>
/// Maparea entitatii User pe tabelul Users.
/// </summary>
public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(256);

        // Unicitatea o garanteaza baza, nu doar verificarea din AuthService: doua
        // inregistrari simultane cu acelasi email nu pot trece amandoua.
        builder.HasIndex(u => u.Email)
            .IsUnique();

        builder.Property(u => u.PasswordHash)
            .IsRequired();

        // Stergerea contului ar sterge si bebelusii (si, mai departe, activitatile lor).
        builder.HasMany(u => u.Babies)
            .WithOne()
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
