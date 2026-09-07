using BabyPlanner.Domain.Common;

namespace BabyPlanner.Domain.Entities;

/// <summary>
/// Bebelusul pentru care se inregistreaza activitati.
/// </summary>
public class Baby : BaseEntity
{
    public required string Name { get; set; }

    public DateOnly DateOfBirth { get; set; }

    /// <summary>Activitatile inregistrate pentru acest bebelus.</summary>
    public ICollection<Activity> Activities { get; set; } = new List<Activity>();
}