using BabyPlanner.Domain.Entities;

namespace BabyPlanner.Application.Common.Interfaces;

/// <summary>
/// Accesul la datele bebelusilor. Interfata sta in Application, implementarea in
/// Infrastructure — asa stratul de business nu stie nimic despre EF Core.
/// Fiecare metoda de scriere isi salveaza singura modificarile (nu avem IUnitOfWork
/// separat, pentru ca DbContext este deja un Unit of Work).
/// </summary>
public interface IBabyRepository
{
    Task<IReadOnlyList<Baby>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<Baby?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default);

    Task AddAsync(Baby baby, CancellationToken cancellationToken = default);

    Task UpdateAsync(Baby baby, CancellationToken cancellationToken = default);

    Task DeleteAsync(Baby baby, CancellationToken cancellationToken = default);
}
