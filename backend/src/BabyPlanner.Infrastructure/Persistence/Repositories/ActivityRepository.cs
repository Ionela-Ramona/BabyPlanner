using BabyPlanner.Application.Common.Interfaces;
using BabyPlanner.Domain.Entities;
using BabyPlanner.Domain.Enums;

using Microsoft.EntityFrameworkCore;

namespace BabyPlanner.Infrastructure.Persistence.Repositories;

/// <summary>Implementarea cu EF Core a accesului la activitati.</summary>
public class ActivityRepository : IActivityRepository
{
    private readonly BabyPlannerDbContext _context;

    public ActivityRepository(BabyPlannerDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Activity>> GetForBabyAsync(
        int babyId,
        ActivityType? type = null,
        DateTimeOffset? from = null,
        DateTimeOffset? to = null,
        CancellationToken cancellationToken = default)
    {
        // Construim interogarea pas cu pas; se trimite la baza o singura data, la ToListAsync.
        var query = _context.Activities
            .AsNoTracking()
            .Where(a => a.BabyId == babyId);

        if (type is not null)
        {
            query = query.Where(a => a.Type == type);
        }

        if (from is not null)
        {
            query = query.Where(a => a.OccurredAt >= from);
        }

        if (to is not null)
        {
            query = query.Where(a => a.OccurredAt < to);
        }

        // Cele mai recente primele — asta asteapta dashboard-ul.
        return await query
            .OrderByDescending(a => a.OccurredAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Activity?> GetByIdAsync(int babyId, int id, CancellationToken cancellationToken = default) =>
        await _context.Activities
            .FirstOrDefaultAsync(a => a.Id == id && a.BabyId == babyId, cancellationToken);

    public async Task AddAsync(Activity activity, CancellationToken cancellationToken = default)
    {
        await _context.Activities.AddAsync(activity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Activity activity, CancellationToken cancellationToken = default)
    {
        _context.Activities.Update(activity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Activity activity, CancellationToken cancellationToken = default)
    {
        _context.Activities.Remove(activity);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
