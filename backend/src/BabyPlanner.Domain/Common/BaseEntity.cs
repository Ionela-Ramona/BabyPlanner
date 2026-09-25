namespace BabyPlanner.Domain.Common;

/// <summary>
/// Baza comuna pentru toate entitatile: expune cheia primara.
/// </summary>
public abstract class BaseEntity
{
    public int Id { get; set; }
}