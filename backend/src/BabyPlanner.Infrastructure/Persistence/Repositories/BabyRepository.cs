using BabyPlanner.Application.Common.Interfaces;
using BabyPlanner.Domain.Entities;

using Microsoft.EntityFrameworkCore;

namespace BabyPlanner.Infrastructure.Persistence.Repositories;

/// <summary>Implementarea cu EF Core a accesului la bebelusi.</summary>
public class BabyRepository : IBabyRepository
{
    private readonly BabyPlannerDbContext _context;

    public BabyRepository(BabyPlannerDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Baby>> GetAllAsync(CancellationToken cancellationToken = default) =>
        // AsNoTracking: citire pura, nu avem nevoie de change tracking.
        await _context.Babies
            .AsNoTracking()
            .OrderBy(b => b.Name)
            .ToListAsync(cancellationToken);

    public async Task<Baby?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        // Aici pastram tracking-ul: entitatea poate fi modificata sau stearsa dupa citire.
        await _context.Babies.FirstOrDefaultAsync(b => b.Id == id, cancellationToken);

    public async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default) =>
        await _context.Babies.AnyAsync(b => b.Id == id, cancellationToken);

    public async Task AddAsync(Baby baby, CancellationToken cancellationToken = default)
    {
        await _context.Babies.AddAsync(baby, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Baby baby, CancellationToken cancellationToken = default)
    {
        // Entitatea e deja urmarita de context; e suficient sa salvam modificarile.
        _context.Babies.Update(baby);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Baby baby, CancellationToken cancellationToken = default)
    {
        _context.Babies.Remove(baby);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
