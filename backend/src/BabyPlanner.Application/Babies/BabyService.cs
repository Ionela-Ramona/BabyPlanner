using BabyPlanner.Application.Babies.Dtos;
using BabyPlanner.Application.Babies.Mapping;
using BabyPlanner.Application.Common.Exceptions;
using BabyPlanner.Application.Common.Interfaces;
using BabyPlanner.Domain.Entities;

using FluentValidation;

namespace BabyPlanner.Application.Babies;

/// <summary>
/// Orchestreaza operatiile pe bebelusi: valideaza intrarea, cere datele de la
/// repository si intoarce DTO-uri. Nu stie nimic despre HTTP sau despre SQL.
/// </summary>
public class BabyService : IBabyService
{
    private readonly IBabyRepository _babies;
    private readonly IValidator<CreateBabyRequest> _createValidator;
    private readonly IValidator<UpdateBabyRequest> _updateValidator;

    public BabyService(
        IBabyRepository babies,
        IValidator<CreateBabyRequest> createValidator,
        IValidator<UpdateBabyRequest> updateValidator)
    {
        _babies = babies;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    public async Task<IReadOnlyList<BabyDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var babies = await _babies.GetAllAsync(cancellationToken);

        return babies.Select(b => b.ToDto()).ToList();
    }

    public async Task<BabyDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var baby = await _babies.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Baby), id);

        return baby.ToDto();
    }

    public async Task<BabyDto> CreateAsync(CreateBabyRequest request, CancellationToken cancellationToken = default)
    {
        await _createValidator.ValidateAndThrowAsync(request, cancellationToken);

        var baby = request.ToEntity();
        await _babies.AddAsync(baby, cancellationToken);

        return baby.ToDto();
    }

    public async Task<BabyDto> UpdateAsync(int id, UpdateBabyRequest request, CancellationToken cancellationToken = default)
    {
        await _updateValidator.ValidateAndThrowAsync(request, cancellationToken);

        var baby = await _babies.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Baby), id);

        request.ApplyTo(baby);
        await _babies.UpdateAsync(baby, cancellationToken);

        return baby.ToDto();
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var baby = await _babies.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Baby), id);

        // Activitatile se sterg odata cu bebelusul (cascade, configurat in BabyConfiguration).
        await _babies.DeleteAsync(baby, cancellationToken);
    }
}
