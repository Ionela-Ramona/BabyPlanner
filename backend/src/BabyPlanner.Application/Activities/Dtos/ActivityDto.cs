using BabyPlanner.Domain.Enums;

namespace BabyPlanner.Application.Activities.Dtos;

/// <summary>Activitatea asa cum este expusa catre exterior (API).</summary>
public record ActivityDto(
    int Id,
    int BabyId,
    ActivityType Type,
    DateTimeOffset OccurredAt,
    string? Notes);
