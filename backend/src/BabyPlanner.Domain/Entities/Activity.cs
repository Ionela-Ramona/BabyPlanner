using BabyPlanner.Domain.Common;
using BabyPlanner.Domain.Enums;

namespace BabyPlanner.Domain.Entities;

/// <summary>
/// O activitate inregistrata pentru un bebelus (masa, somn, scutec etc.).
/// </summary>
public class Activity : BaseEntity
{
    public int BabyId { get; set; }

    public ActivityType Type { get; set; }

    /// <summary>Momentul in care a avut loc activitatea, cu fus orar pastrat.</summary>
    public DateTimeOffset OccurredAt { get; set; }

    public string? Notes { get; set; }

    /// <summary>Bebelusul caruia ii apartine activitatea.</summary>
    public Baby? Baby { get; set; }
}