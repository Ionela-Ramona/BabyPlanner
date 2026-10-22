using BabyPlanner.Application.Common.Interfaces;
using BabyPlanner.Domain.Entities;

using Microsoft.EntityFrameworkCore;

namespace BabyPlanner.Infrastructure.Persistence.Repositories;

/// <summary>Implementarea cu EF Core a accesului la conturi.</summary>
public class UserRepository : IUserRepository
{
    private readonly BabyPlannerDbContext _context;

    public UserRepository(BabyPlannerDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default) =>
        await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        await _context.Users.AddAsync(user, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
