using System.Security.Claims;

using BabyPlanner.Application.Common.Interfaces;

using Microsoft.IdentityModel.JsonWebTokens;

namespace BabyPlanner.Api.Auth;

/// <summary>
/// Citeste id-ul parintelui din token-ul cererii curente. JwtBearer a verificat deja
/// semnatura si expirarea; aici doar scoatem claim-ul "sub".
/// </summary>
public class HttpCurrentUser : ICurrentUser
{
    private readonly IHttpContextAccessor _accessor;

    public HttpCurrentUser(IHttpContextAccessor accessor)
    {
        _accessor = accessor;
    }

    public int? UserId =>
        int.TryParse(_accessor.HttpContext?.User.FindFirstValue(JwtRegisteredClaimNames.Sub), out var id) ? id : null;
}
