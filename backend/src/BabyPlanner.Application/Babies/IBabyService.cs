using BabyPlanner.Application.Babies.Dtos;

namespace BabyPlanner.Application.Babies;

/// <summary>Cazurile de utilizare pentru bebelusi.</summary>
public interface IBabyService
{
    Task<IReadOnlyList<BabyDto>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <exception cref="Common.Exceptions.NotFoundException">Daca bebelusul nu exista.</exception>
    Task<BabyDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<BabyDto> CreateAsync(CreateBabyRequest request, CancellationToken cancellationToken = default);

    Task<BabyDto> UpdateAsync(int id, UpdateBabyRequest request, CancellationToken cancellationToken = default);

    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
