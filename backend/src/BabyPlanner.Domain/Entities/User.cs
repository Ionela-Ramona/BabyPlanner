using BabyPlanner.Domain.Common;

namespace BabyPlanner.Domain.Entities;

/// <summary>
/// Contul unui parinte. Fiecare bebelus are un singur proprietar; nu exista inca
/// impartirea unui bebelus intre mai multi parinti.
/// </summary>
public class User : BaseEntity
{
    /// <summary>Se salveaza mereu cu litere mici, ca "Ana@x.ro" si "ana@x.ro" sa fie acelasi cont.</summary>
    public required string Email { get; set; }

    /// <summary>Hash-ul parolei (PBKDF2, prin PasswordHasher din ASP.NET Identity). Parola nu se salveaza niciodata.</summary>
    public required string PasswordHash { get; set; }

    public ICollection<Baby> Babies { get; set; } = new List<Baby>();
}
