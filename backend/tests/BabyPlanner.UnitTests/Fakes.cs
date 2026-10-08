using BabyPlanner.Application.Common.Interfaces;
using BabyPlanner.Domain.Entities;
using BabyPlanner.Domain.Enums;

namespace BabyPlanner.UnitTests;

/// <summary>Un "acum" fix, ca testele sa nu depinda de ceasul masinii.</summary>
internal sealed class FixedClock(DateTimeOffset now) : IDateTimeProvider
{
    public DateTimeOffset Now { get; } = now;
}

/// <summary>Repository de bebelusi in memorie; da id-uri la adaugare, ca baza de date.</summary>
internal sealed class InMemoryBabyRepository : IBabyRepository
{
    public List<Baby> Babies { get; } = [];

    public Task<IReadOnlyList<Baby>> GetAllAsync(CancellationToken cancellationToken = default) =>
        Task.FromResult<IReadOnlyList<Baby>>(Babies.ToList());

    public Task<Baby?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        Task.FromResult(Babies.FirstOrDefault(b => b.Id == id));

    public Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default) =>
        Task.FromResult(Babies.Any(b => b.Id == id));

    public Task AddAsync(Baby baby, CancellationToken cancellationToken = default)
    {
        baby.Id = Babies.Count == 0 ? 1 : Babies.Max(b => b.Id) + 1;
        Babies.Add(baby);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(Baby baby, CancellationToken cancellationToken = default) => Task.CompletedTask;

    public Task DeleteAsync(Baby baby, CancellationToken cancellationToken = default)
    {
        Babies.Remove(baby);
        return Task.CompletedTask;
    }
}

/// <summary>Repository de activitati in memorie; retine si ultimul interval cerut.</summary>
internal sealed class InMemoryActivityRepository : IActivityRepository
{
    public List<Activity> Activities { get; } = [];

    public (DateTimeOffset? From, DateTimeOffset? To) LastRange { get; private set; }

    public Task<IReadOnlyList<Activity>> GetForBabyAsync(
        int babyId,
        ActivityType? type = null,
        DateTimeOffset? from = null,
        DateTimeOffset? to = null,
        CancellationToken cancellationToken = default)
    {
        LastRange = (from, to);
        return Task.FromResult<IReadOnlyList<Activity>>(Activities
            .Where(a => a.BabyId == babyId
                && (type is null || a.Type == type)
                && (from is null || a.OccurredAt >= from)
                && (to is null || a.OccurredAt < to))
            .ToList());
    }

    public Task<Activity?> GetByIdAsync(int babyId, int id, CancellationToken cancellationToken = default) =>
        Task.FromResult(Activities.FirstOrDefault(a => a.BabyId == babyId && a.Id == id));

    public Task<IReadOnlyList<Activity>> GetInProgressAsync(int babyId, CancellationToken cancellationToken = default) =>
        Task.FromResult<IReadOnlyList<Activity>>(Activities.Where(a => a.BabyId == babyId && a.InProgress).ToList());

    public Task<IReadOnlyList<Activity>> GetLatestPerTypeAsync(int babyId, CancellationToken cancellationToken = default) =>
        Task.FromResult<IReadOnlyList<Activity>>(Activities
            .Where(a => a.BabyId == babyId)
            .GroupBy(a => a.Type)
            .Select(g => g.MaxBy(a => a.OccurredAt)!)
            .ToList());

    public Task AddAsync(Activity activity, CancellationToken cancellationToken = default)
    {
        activity.Id = Activities.Count == 0 ? 1 : Activities.Max(a => a.Id) + 1;
        Activities.Add(activity);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(Activity activity, CancellationToken cancellationToken = default) => Task.CompletedTask;

    public Task DeleteAsync(Activity activity, CancellationToken cancellationToken = default)
    {
        Activities.Remove(activity);
        return Task.CompletedTask;
    }
}
