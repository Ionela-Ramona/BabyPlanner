using System.Text;

using BabyPlanner.Application.Common.Interfaces;
using BabyPlanner.Domain.Entities;

using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace BabyPlanner.Api.Auth;

/// <summary>Emite un JWT semnat cu HMAC-SHA256, cu id-ul parintelui in claim-ul "sub".</summary>
public class JwtTokenGenerator : ITokenGenerator
{
    private readonly JwtOptions _options;

    public JwtTokenGenerator(IOptions<JwtOptions> options)
    {
        _options = options.Value;
    }

    /// <summary>Aceeasi cheie o foloseste si JwtBearer la verificare (Program.cs).</summary>
    public static SymmetricSecurityKey SigningKey(JwtOptions options) =>
        new(Encoding.UTF8.GetBytes(options.Key));

    public (string Token, DateTimeOffset ExpiresAt) Generate(User user)
    {
        // Ceasul real, nu IDateTimeProvider: expirarea o verifica JwtBearer tot cu ceasul
        // real, deci un "acum" fix din teste ar produce token-uri deja expirate.
        var expiresAt = DateTimeOffset.UtcNow.AddDays(_options.ExpiresInDays);

        var token = new JsonWebTokenHandler().CreateToken(new SecurityTokenDescriptor
        {
            Issuer = _options.Issuer,
            Audience = _options.Audience,
            Expires = expiresAt.UtcDateTime,
            Claims = new Dictionary<string, object>
            {
                [JwtRegisteredClaimNames.Sub] = user.Id.ToString(),
                [JwtRegisteredClaimNames.Email] = user.Email,
            },
            SigningCredentials = new SigningCredentials(SigningKey(_options), SecurityAlgorithms.HmacSha256),
        });

        return (token, expiresAt);
    }
}
