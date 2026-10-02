using BabyPlanner.Domain.Common;
using BabyPlanner.Domain.Enums;

namespace BabyPlanner.Domain.Entities;

/// <summary>
/// O activitate inregistrata pentru un bebelus (masa, somn, scutec etc.).
/// </summary>
/// <remarks>
/// Detaliile structurate (cantitate, durata, tip de scutec) sunt optionale si au sens
/// doar pentru anumite tipuri — o singura entitate cu campuri optionale, nu o ierarhie
/// de clase (varianta A din BabyPlannerDoc.docx). Activitatile vechi raman valide:
/// toate campurile noi pot lipsi.
/// </remarks>
public class Activity : BaseEntity
{
    public int BabyId { get; set; }

    public ActivityType Type { get; set; }

    /// <summary>Momentul in care a avut loc activitatea (inceputul, pentru somn). Se persista in UTC.</summary>
    public DateTimeOffset OccurredAt { get; set; }

    public string? Notes { get; set; }

    /// <summary>Cantitatea in ml. Doar pentru <see cref="ActivityType.Feeding"/> (biberon).</summary>
    public int? AmountMl { get; set; }

    /// <summary>Durata in minute: somnul sau alaptarea. Doar pentru Sleep si Feeding.</summary>
    public int? DurationMinutes { get; set; }

    /// <summary>Ce a fost in scutec. Doar pentru <see cref="ActivityType.Diaper"/>.</summary>
    public DiaperKind? DiaperKind { get; set; }

    /// <summary>
    /// Somnul a inceput si inca nu s-a terminat ("Încă doarme"). La trezire devine
    /// <c>false</c> si primeste <see cref="DurationMinutes"/>. Un camp explicit, nu
    /// "durata lipseste": somnurile vechi nu au durata, dar nici nu dorm inca.
    /// </summary>
    public bool InProgress { get; set; }

    /// <summary>Bebelusul caruia ii apartine activitatea.</summary>
    public Baby? Baby { get; set; }
}
