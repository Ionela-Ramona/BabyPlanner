using BabyPlanner.Domain.Enums;

namespace BabyPlanner.Application.Activities.Dtos;

/// <summary>
/// Datele necesare pentru a inregistra o activitate.
/// BabyId vine din ruta (/api/babies/{babyId}/activities), nu din corpul cererii.
/// </summary>
public record CreateActivityRequest(
    ActivityType Type,
    DateTimeOffset OccurredAt,
    string? Notes);
