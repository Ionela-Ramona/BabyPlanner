using BabyPlanner.Application.Activities.Dtos;
using BabyPlanner.Application.Activities.Mapping;
using BabyPlanner.Application.Common.Exceptions;
using BabyPlanner.Application.Common.Interfaces;
using BabyPlanner.Domain.Entities;
using BabyPlanner.Domain.Enums;

using FluentValidation;

namespace BabyPlanner.Application.Activities;

/// <summary>
/// Orchestreaza operatiile pe activitati. Regula de business care traieste aici:
/// o activitate apartine intotdeauna unui bebelus existent.
/// </summary>
public class ActivityService : IActivityService
{
    private readonly IActivityRepository _activities;
    private readonly IBabyRepository _babies;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IValidator<CreateActivityRequest> _createValidator;
    private readonly IValidator<UpdateActivityRequest> _updateValidator;

    public ActivityService(
        IActivityRepository activities,
        IBabyRepository babies,
        IDateTimeProvider dateTimeProvider,
        IValidator<CreateActivityRequest> createValidator,
        IValidator<UpdateActivityRequest> updateValidator)
    {
        _activities = activities;
        _babies = babies;
        _dateTimeProvider = dateTimeProvider;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    public async Task<IReadOnlyList<ActivityDto>> GetForBabyAsync(
        int babyId,
        ActivityType? type = null,
        CancellationToken cancellationToken = default)
    {
        await EnsureBabyExistsAsync(babyId, cancellationToken);

        var activities = await _activities.GetForBabyAsync(babyId, type, cancellationToken: cancellationToken);

        return activities.Select(a => a.ToDto()).ToList();
    }

    public async Task<IReadOnlyList<ActivityDto>> GetTodayAsync(
        int babyId,
        ActivityType? type = null,
        CancellationToken cancellationToken = default)
    {
        await EnsureBabyExistsAsync(babyId, cancellationToken);

        // "Azi" inseamna intervalul [miezul noptii, miezul noptii de maine), calculat
        // in fusul orar al serverului. Repository-ul primeste doar intervalul gata calculat.
        var now = _dateTimeProvider.Now;
        var startOfDay = new DateTimeOffset(now.Year, now.Month, now.Day, 0, 0, 0, now.Offset);
        var startOfNextDay = startOfDay.AddDays(1);

        var activities = await _activities.GetForBabyAsync(
            babyId, type, startOfDay, startOfNextDay, cancellationToken);

        return activities.Select(a => a.ToDto()).ToList();
    }

    public async Task<ActivityDto> GetByIdAsync(int babyId, int id, CancellationToken cancellationToken = default)
    {
        var activity = await FindOrThrowAsync(babyId, id, cancellationToken);

        return activity.ToDto();
    }

    public async Task<ActivityDto> CreateAsync(
        int babyId,
        CreateActivityRequest request,
        CancellationToken cancellationToken = default)
    {
        await _createValidator.ValidateAndThrowAsync(request, cancellationToken);
        await EnsureBabyExistsAsync(babyId, cancellationToken);

        var activity = request.ToEntity(babyId);
        await _activities.AddAsync(activity, cancellationToken);

        return activity.ToDto();
    }

    public async Task<ActivityDto> UpdateAsync(
        int babyId,
        int id,
        UpdateActivityRequest request,
        CancellationToken cancellationToken = default)
    {
        await _updateValidator.ValidateAndThrowAsync(request, cancellationToken);

        var activity = await FindOrThrowAsync(babyId, id, cancellationToken);

        request.ApplyTo(activity);
        await _activities.UpdateAsync(activity, cancellationToken);

        return activity.ToDto();
    }

    public async Task DeleteAsync(int babyId, int id, CancellationToken cancellationToken = default)
    {
        var activity = await FindOrThrowAsync(babyId, id, cancellationToken);

        await _activities.DeleteAsync(activity, cancellationToken);
    }

    /// <summary>Verifica existenta bebelusului inainte de a lucra cu activitatile lui.</summary>
    private async Task EnsureBabyExistsAsync(int babyId, CancellationToken cancellationToken)
    {
        if (!await _babies.ExistsAsync(babyId, cancellationToken))
        {
            throw new NotFoundException(nameof(Baby), babyId);
        }
    }

    private async Task<Activity> FindOrThrowAsync(int babyId, int id, CancellationToken cancellationToken)
    {
        await EnsureBabyExistsAsync(babyId, cancellationToken);

        return await _activities.GetByIdAsync(babyId, id, cancellationToken)
            ?? throw new NotFoundException(nameof(Activity), id);
    }
}
