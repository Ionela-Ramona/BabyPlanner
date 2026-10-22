using BabyPlanner.Application.Auth;
using BabyPlanner.Application.Auth.Dtos;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace BabyPlanner.Api.Controllers;

/// <summary>
/// Inregistrare si login — singurele endpoint-uri accesibile fara token.
/// Limitate ca numar de cereri pe minut, ca o parola sa nu poata fi ghicita prin forta bruta.
/// </summary>
[ApiController]
[Route("api/auth")]
[Produces("application/json")]
[AllowAnonymous]
[EnableRateLimiting(AuthRateLimit.PolicyName)]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth)
    {
        _auth = auth;
    }

    /// <summary>Creeaza un cont si il autentifica imediat.</summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request, CancellationToken cancellationToken) =>
        Ok(await _auth.RegisterAsync(request, cancellationToken));

    /// <summary>Intoarce un token pentru un cont existent.</summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request, CancellationToken cancellationToken) =>
        Ok(await _auth.LoginAsync(request, cancellationToken));
}

/// <summary>Numele si marimea limitei de cereri pentru <see cref="AuthController"/>.</summary>
public static class AuthRateLimit
{
    public const string PolicyName = "auth";

    /// <summary>Cereri pe minut, de la aceeasi adresa IP.</summary>
    public const int PermitsPerMinute = 10;
}
