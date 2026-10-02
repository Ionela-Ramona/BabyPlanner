using BabyPlanner.Application.Activities.Dtos;
using BabyPlanner.Domain.Entities;

namespace BabyPlanner.Application.Activities.Mapping;

/// <summary>Conversiile intre entitatea Activity si DTO-urile ei.</summary>
public static class ActivityMappings
{
    public static ActivityDto ToDto(this Activity activity) =>
        new(
            activity.Id,
            activity.BabyId,
            activity.Type,
            activity.OccurredAt,
            activity.Notes,
            activity.AmountMl,
            activity.DurationMinutes,
            activity.DiaperKind,
            activity.InProgress);

    public static Activity ToEntity(this CreateActivityRequest request, int babyId)
    {
        var activity = new Activity { BabyId = babyId };
        request.ApplyTo(activity);
        return activity;
    }

    /// <summary>Copiaza valorile din cerere peste o entitate (noua sau urmarita de EF Core).</summary>
    public static void ApplyTo(this IActivityDetails request, Activity activity)
    {
        activity.Type = request.Type;
        activity.OccurredAt = request.OccurredAt;
        activity.Notes = request.Notes?.Trim();
        activity.AmountMl = request.AmountMl;
        activity.DurationMinutes = request.DurationMinutes;
        activity.DiaperKind = request.DiaperKind;
        activity.InProgress = request.InProgress;
    }
}
