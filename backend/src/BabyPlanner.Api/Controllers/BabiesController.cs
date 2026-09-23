using BabyPlanner.Application.Babies;
using BabyPlanner.Application.Babies.Dtos;

using Microsoft.AspNetCore.Mvc;

namespace BabyPlanner.Api.Controllers;

/// <summary>
/// Endpoint-urile HTTP pentru bebelusi.
/// Controllerul e deliberat "subtire": leaga HTTP-ul de serviciu si atat.
/// </summary>
[ApiController]
[Route("api/babies")]
[Produces("application/json")]
public class BabiesController : ControllerBase
{
    private readonly IBabyService _babies;

    public BabiesController(IBabyService babies)
    {
        _babies = babies;
    }

    /// <summary>Toti bebelusii, ordonati dupa nume.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<BabyDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<BabyDto>>> GetAll(CancellationToken cancellationToken)
    {
        var babies = await _babies.GetAllAsync(cancellationToken);

        return Ok(babies);
    }

    /// <summary>Un bebelus dupa id.</summary>
    [HttpGet("{id:int}", Name = nameof(GetBabyById))]
    [ProducesResponseType(typeof(BabyDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BabyDto>> GetBabyById(int id, CancellationToken cancellationToken)
    {
        var baby = await _babies.GetByIdAsync(id, cancellationToken);

        return Ok(baby);
    }

    /// <summary>Creeaza un bebelus.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(BabyDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<BabyDto>> Create(
        CreateBabyRequest request,
        CancellationToken cancellationToken)
    {
        var baby = await _babies.CreateAsync(request, cancellationToken);

        // 201 + header-ul Location catre resursa nou creata.
        return CreatedAtRoute(nameof(GetBabyById), new { id = baby.Id }, baby);
    }

    /// <summary>Actualizeaza un bebelus.</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(BabyDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BabyDto>> Update(
        int id,
        UpdateBabyRequest request,
        CancellationToken cancellationToken)
    {
        var baby = await _babies.UpdateAsync(id, request, cancellationToken);

        return Ok(baby);
    }

    /// <summary>Sterge un bebelus impreuna cu activitatile lui.</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await _babies.DeleteAsync(id, cancellationToken);

        return NoContent();
    }
}
