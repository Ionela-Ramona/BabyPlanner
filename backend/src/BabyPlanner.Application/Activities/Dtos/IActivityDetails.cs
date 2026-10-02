using BabyPlanner.Domain.Enums;

namespace BabyPlanner.Application.Activities.Dtos;

/// <summary>
/// Forma comuna a cererilor de creare si de editare, ca regulile de validare si
/// maparea sa fie scrise o singura data pentru amandoua.
/// </summary>
public interface IActivityDetails
{
    ActivityType Type { get; }
    DateTimeOffset OccurredAt { get; }
    string? Notes { get; }
    int? AmountMl { get; }
    int? DurationMinutes { get; }
    DiaperKind? DiaperKind { get; }
    bool InProgress { get; }
}
