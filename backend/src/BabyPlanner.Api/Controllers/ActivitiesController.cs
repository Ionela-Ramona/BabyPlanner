using BabyPlanner.Application.Activities;
using BabyPlanner.Application.Activities.Dtos;
using BabyPlanner.Domain.Enums;

using Microsoft.AspNetCore.Mvc;

namespace BabyPlanner.Api.Controllers;

/// <summary>
/// Endpoint-urile HTTP pentru activitatile unui bebelus.
/// Rutele sunt imbricate sub /api/babies/{babyId}, ca relatia sa fie explicita in URL.
/// </summary>
[ApiController]
[Route("api/babies/{babyId:int}/activities")]
[Produces("application/json")]
public class ActivitiesController : ControllerBase
{
    private readonly IActivityService _activities;

    public ActivitiesController(IActivityService activities)
    {
        _activities = activities;
    }

    /// <summary>Activitatile unui bebelus, optional filtrate dupa tip.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ActivityDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<ActivityDto>>> GetForBaby(
        int babyId,
        [FromQuery] ActivityType? type,
        CancellationToken cancellationToken)
    {
        var activities = await _activities.GetForBabyAsync(babyId, type, cancellationToken);

        return Ok(activities);
    }

    /// <summary>Activitatile de azi — sursa de date pentru dashboard.</summary>
    [HttpGet("today")]
    [ProducesResponseType(typeof(IReadOnlyList<ActivityDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<ActivityDto>>> GetToday(
        int babyId,
        [FromQuery] ActivityType? type,
        CancellationToken cancellationToken)
    {
        var activities = await _activities.GetTodayAsync(babyId, type, cancellationToken);

        return Ok(activities);
    }

    /// <summary>O activitate anume.</summary>
    [HttpGet("{id:int}", Name = nameof(GetActivityById))]
    [ProducesResponseType(typeof(ActivityDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ActivityDto>> GetActivityById(
        int babyId,
        int id,
        CancellationToken cancellationToken)
    {
        var activity = await _activities.GetByIdAsync(babyId, id, cancellationToken);

        return Ok(activity);
    }

    /// <summary>Inregistreaza o activitate pentru un bebelus.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ActivityDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ActivityDto>> Create(
        int babyId,
        CreateActivityRequest request,
        CancellationToken cancellationToken)
    {
        var activity = await _activities.CreateAsync(babyId, request, cancellationToken);

        return CreatedAtRoute(
            nameof(GetActivityById),
            new { babyId, id = activity.Id },
            activity);
    }

    /// <summary>Actualizeaza o activitate.</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ActivityDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ActivityDto>> Update(
        int babyId,
        int id,
        UpdateActivityRequest request,
        CancellationToken cancellationToken)
    {
        var activity = await _activities.UpdateAsync(babyId, id, request, cancellationToken);

        return Ok(activity);
    }

    /// <summary>Sterge o activitate.</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int babyId, int id, CancellationToken cancellationToken)
    {
        await _activities.DeleteAsync(babyId, id, cancellationToken);

        return NoContent();
    }
}
