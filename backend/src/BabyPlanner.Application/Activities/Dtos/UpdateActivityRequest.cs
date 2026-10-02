using BabyPlanner.Domain.Enums;

namespace BabyPlanner.Application.Activities.Dtos;

/// <summary>Datele modificabile ale unei activitati (PUT inlocuieste tot, deci si detaliile).</summary>
public record UpdateActivityRequest(
    ActivityType Type,
    DateTimeOffset OccurredAt,
    string? Notes,
    int? AmountMl = null,
    int? DurationMinutes = null,
    DiaperKind? DiaperKind = null,
    bool InProgress = false) : IActivityDetails;
