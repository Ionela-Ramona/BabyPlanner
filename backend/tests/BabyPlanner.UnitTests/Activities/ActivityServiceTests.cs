using BabyPlanner.Application.Activities;
using BabyPlanner.Application.Activities.Dtos;
using BabyPlanner.Application.Activities.Validators;
using BabyPlanner.Application.Common.Exceptions;
using BabyPlanner.Domain.Entities;
using BabyPlanner.Domain.Enums;

using FluentValidation;

namespace BabyPlanner.UnitTests.Activities;

/// <summary>Orchestrarea activitatilor: bebelusul trebuie sa existe, "azi" e calculat corect.</summary>
public class ActivityServiceTests
{
    // 16:00 in Romania (UTC+3), ca "azi" sa nu coincida cu ziua UTC din greseala.
    private static readonly DateTimeOffset Now = new(2026, 9, 25, 16, 0, 0, TimeSpan.FromHours(3));

    private readonly InMemoryBabyRepository _babies = new();
    private readonly InMemoryActivityRepository _activities = new();
    private readonly ActivityService _service;
    private readonly int _babyId;

    public ActivityServiceTests()
    {
        var clock = new FixedClock(Now);
        _service = new ActivityService(
            _activities,
            _babies,
            clock,
            new CreateActivityRequestValidator(clock),
            new UpdateActivityRequestValidator(clock));

        var baby = new Baby { Name = "Maria", DateOfBirth = new DateOnly(2026, 3, 24) };
        _babies.AddAsync(baby).Wait();
        _babyId = baby.Id;
    }

    private Activity Seed(ActivityType type, DateTimeOffset at, int? babyId = null, bool inProgress = false)
    {
        var activity = new Activity { BabyId = babyId ?? _babyId, Type = type, OccurredAt = at, InProgress = inProgress };
        _activities.AddAsync(activity).Wait();
        return activity;
    }

    [Fact]
    public async Task Create_trims_notes_and_attaches_the_activity_to_the_baby()
    {
        var created = await _service.CreateAsync(
            _babyId,
            new CreateActivityRequest(ActivityType.Feeding, Now.AddMinutes(-5), "  biberon  ", AmountMl: 120));

        Assert.Equal(_babyId, created.BabyId);
        Assert.Equal("biberon", created.Notes);
        Assert.Equal(120, created.AmountMl);
        Assert.Equal(created.Id, Assert.Single(_activities.Activities).Id);
    }

    [Fact]
    public async Task Create_validates_before_saving()
    {
        await Assert.ThrowsAsync<ValidationException>(() => _service.CreateAsync(
            _babyId, new CreateActivityRequest(ActivityType.Sleep, Now, null, AmountMl: 100)));

        Assert.Empty(_activities.Activities);
    }

    [Fact]
    public async Task Today_asks_for_local_midnight_to_next_midnight()
    {
        var yesterday = Seed(ActivityType.Feeding, new DateTimeOffset(2026, 9, 24, 23, 59, 0, Now.Offset));
        var morning = Seed(ActivityType.Feeding, new DateTimeOffset(2026, 9, 25, 0, 0, 0, Now.Offset));

        var today = await _service.GetTodayAsync(_babyId);

        Assert.Equal(new DateTimeOffset(2026, 9, 25, 0, 0, 0, Now.Offset), _activities.LastRange.From);
        Assert.Equal(new DateTimeOffset(2026, 9, 26, 0, 0, 0, Now.Offset), _activities.LastRange.To);
        Assert.Equal([morning.Id], today.Select(a => a.Id));
        Assert.DoesNotContain(today, a => a.Id == yesterday.Id);
    }

    [Fact]
    public async Task Lists_only_the_activities_of_the_requested_baby_and_type()
    {
        var other = new Baby { Name = "Ion", DateOfBirth = new DateOnly(2026, 1, 1) };
        await _babies.AddAsync(other);
        var sleep = Seed(ActivityType.Sleep, Now.AddHours(-2));
        Seed(ActivityType.Feeding, Now.AddHours(-1));
        Seed(ActivityType.Sleep, Now.AddHours(-1), babyId: other.Id);

        var sleeps = await _service.GetForBabyAsync(_babyId, ActivityType.Sleep);

        Assert.Equal([sleep.Id], sleeps.Select(a => a.Id));
    }

    [Fact]
    public async Task In_progress_and_latest_per_type_pass_through_the_repository()
    {
        var sleeping = Seed(ActivityType.Sleep, Now.AddHours(-1), inProgress: true);
        Seed(ActivityType.Feeding, Now.AddHours(-5));
        var lastFeed = Seed(ActivityType.Feeding, Now.AddHours(-2));

        Assert.Equal([sleeping.Id], (await _service.GetInProgressAsync(_babyId)).Select(a => a.Id));
        Assert.Equal(
            [sleeping.Id, lastFeed.Id],
            (await _service.GetLatestPerTypeAsync(_babyId)).Select(a => a.Id).Order());
    }

    [Fact]
    public async Task Update_replaces_every_detail()
    {
        var sleep = Seed(ActivityType.Sleep, Now.AddHours(-1), inProgress: true);

        var woke = await _service.UpdateAsync(
            _babyId, sleep.Id, new UpdateActivityRequest(ActivityType.Sleep, sleep.OccurredAt, null, DurationMinutes: 60));

        Assert.False(woke.InProgress);
        Assert.Equal(60, woke.DurationMinutes);
        Assert.False(sleep.InProgress);
    }

    [Fact]
    public async Task Delete_removes_the_activity()
    {
        var activity = Seed(ActivityType.Diaper, Now.AddHours(-1));

        await _service.DeleteAsync(_babyId, activity.Id);

        Assert.Empty(_activities.Activities);
    }

    [Fact]
    public async Task An_unknown_baby_is_not_found_on_every_operation()
    {
        const int missing = 999;
        var create = new CreateActivityRequest(ActivityType.Other, Now, null);
        var update = new UpdateActivityRequest(ActivityType.Other, Now, null);

        var error = await Assert.ThrowsAsync<NotFoundException>(() => _service.GetForBabyAsync(missing));
        Assert.Equal(nameof(Baby), error.EntityName);

        await Assert.ThrowsAsync<NotFoundException>(() => _service.GetTodayAsync(missing));
        await Assert.ThrowsAsync<NotFoundException>(() => _service.GetInProgressAsync(missing));
        await Assert.ThrowsAsync<NotFoundException>(() => _service.GetLatestPerTypeAsync(missing));
        await Assert.ThrowsAsync<NotFoundException>(() => _service.GetByIdAsync(missing, 1));
        await Assert.ThrowsAsync<NotFoundException>(() => _service.CreateAsync(missing, create));
        await Assert.ThrowsAsync<NotFoundException>(() => _service.UpdateAsync(missing, 1, update));
        await Assert.ThrowsAsync<NotFoundException>(() => _service.DeleteAsync(missing, 1));
    }

    [Fact]
    public async Task Another_babys_activity_is_not_found()
    {
        var other = new Baby { Name = "Ion", DateOfBirth = new DateOnly(2026, 1, 1) };
        await _babies.AddAsync(other);
        var theirs = Seed(ActivityType.Feeding, Now.AddHours(-1), babyId: other.Id);

        var error = await Assert.ThrowsAsync<NotFoundException>(() => _service.GetByIdAsync(_babyId, theirs.Id));
        Assert.Equal(nameof(Activity), error.EntityName);

        await Assert.ThrowsAsync<NotFoundException>(() => _service.DeleteAsync(_babyId, theirs.Id));
        Assert.Contains(theirs, _activities.Activities);
    }
}
