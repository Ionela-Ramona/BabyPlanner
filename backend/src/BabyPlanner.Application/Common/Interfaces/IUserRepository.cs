using BabyPlanner.Domain.Entities;

namespace BabyPlanner.Application.Common.Interfaces;

/// <summary>Accesul la conturile parintilor.</summary>
public interface IUserRepository
{
    /// <param name="email">Deja normalizat (trim + litere mici).</param>
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);

    Task AddAsync(User user, CancellationToken cancellationToken = default);
}
