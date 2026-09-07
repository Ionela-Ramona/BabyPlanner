namespace BabyPlanner.Domain.Enums;

/// <summary>
/// Tipurile de activitati inregistrate pentru un bebelus.
/// Valorile sunt explicite ca sa ramana stabile in baza de date.
/// </summary>
public enum ActivityType
{
    Feeding = 1,
    Sleep = 2,
    Diaper = 3,
    Medicine = 4,
    Other = 5
}