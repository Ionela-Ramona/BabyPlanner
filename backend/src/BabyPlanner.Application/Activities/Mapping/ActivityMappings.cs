using BabyPlanner.Application.Activities.Dtos;
using BabyPlanner.Domain.Entities;

namespace BabyPlanner.Application.Activities.Mapping;

/// <summary>Conversiile intre entitatea Activity si DTO-urile ei.</summary>
public static class ActivityMappings
{
    public static ActivityDto ToDto(this Activity activity) =>
        new(activity.Id, activity.BabyId, activity.Type, activity.OccurredAt, activity.Notes);

    public static Activity ToEntity(this CreateActivityRequest request, int babyId) =>
        new()
        {
            BabyId = babyId,
            Type = request.Type,
            OccurredAt = request.OccurredAt,
            Notes = request.Notes?.Trim()
        };

    /// <summary>Copiaza valorile din cerere peste o entitate urmarita de EF Core.</summary>
    public static void ApplyTo(this UpdateActivityRequest request, Activity activity)
    {
        activity.Type = request.Type;
        activity.OccurredAt = request.OccurredAt;
        activity.Notes = request.Notes?.Trim();
    }
}
