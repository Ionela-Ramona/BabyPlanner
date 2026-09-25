using BabyPlanner.Domain.Enums;

namespace BabyPlanner.Application.Activities.Dtos;

/// <summary>Datele modificabile ale unei activitati.</summary>
public record UpdateActivityRequest(
    ActivityType Type,
    DateTimeOffset OccurredAt,
    string? Notes);
