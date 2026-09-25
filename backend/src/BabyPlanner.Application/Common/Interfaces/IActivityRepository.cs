using BabyPlanner.Domain.Entities;
using BabyPlanner.Domain.Enums;

namespace BabyPlanner.Application.Common.Interfaces;

/// <summary>
/// Accesul la activitatile unui bebelus.
/// </summary>
public interface IActivityRepository
{
    /// <summary>
    /// Activitatile unui bebelus, optional filtrate dupa tip si dupa un interval de timp.
    /// Intervalul este inchis la stanga si deschis la dreapta: [from, to).
    /// Serviciul calculeaza intervalul (de exemplu "azi"), repository-ul doar interogheaza.
    /// </summary>
    Task<IReadOnlyList<Activity>> GetForBabyAsync(
        int babyId,
        ActivityType? type = null,
        DateTimeOffset? from = null,
        DateTimeOffset? to = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// O activitate anume a unui bebelus. Primeste si <paramref name="babyId"/> ca sa nu
    /// putem citi din greseala activitatea altui bebelus printr-un id ghicit.
    /// </summary>
    Task<Activity?> GetByIdAsync(int babyId, int id, CancellationToken cancellationToken = default);

    Task AddAsync(Activity activity, CancellationToken cancellationToken = default);

    Task UpdateAsync(Activity activity, CancellationToken cancellationToken = default);

    Task DeleteAsync(Activity activity, CancellationToken cancellationToken = default);
}
