using BabyPlanner.Application.Activities.Dtos;
using BabyPlanner.Domain.Enums;

namespace BabyPlanner.Application.Activities;

/// <summary>Cazurile de utilizare pentru activitatile unui bebelus.</summary>
public interface IActivityService
{
    /// <summary>Toate activitatile unui bebelus, optional filtrate dupa tip.</summary>
    Task<IReadOnlyList<ActivityDto>> GetForBabyAsync(
        int babyId,
        ActivityType? type = null,
        CancellationToken cancellationToken = default);

    /// <summary>Activitatile de azi — sursa datelor pentru dashboard.</summary>
    Task<IReadOnlyList<ActivityDto>> GetTodayAsync(
        int babyId,
        ActivityType? type = null,
        CancellationToken cancellationToken = default);

    Task<ActivityDto> GetByIdAsync(int babyId, int id, CancellationToken cancellationToken = default);

    Task<ActivityDto> CreateAsync(int babyId, CreateActivityRequest request, CancellationToken cancellationToken = default);

    Task<ActivityDto> UpdateAsync(int babyId, int id, UpdateActivityRequest request, CancellationToken cancellationToken = default);

    Task DeleteAsync(int babyId, int id, CancellationToken cancellationToken = default);
}
