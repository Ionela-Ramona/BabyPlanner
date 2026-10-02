using BabyPlanner.Domain.Enums;

namespace BabyPlanner.Application.Activities.Dtos;

/// <summary>
/// Datele necesare pentru a inregistra o activitate.
/// BabyId vine din ruta (/api/babies/{babyId}/activities), nu din corpul cererii.
/// Detaliile (ultimii parametri) sunt optionale, ca un client vechi sa poata trimite
/// in continuare doar tipul, momentul si notitele.
/// </summary>
public record CreateActivityRequest(
    ActivityType Type,
    DateTimeOffset OccurredAt,
    string? Notes,
    int? AmountMl = null,
    int? DurationMinutes = null,
    DiaperKind? DiaperKind = null,
    bool InProgress = false) : IActivityDetails;
