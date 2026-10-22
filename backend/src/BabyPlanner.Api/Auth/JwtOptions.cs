using System.ComponentModel.DataAnnotations;

namespace BabyPlanner.Api.Auth;

/// <summary>
/// Setarile JWT din sectiunea "Jwt" (Options Pattern). Cheia nu sta in appsettings.json:
/// in Development vine din appsettings.Development.json, in productie din variabila
/// de mediu <c>Jwt__Key</c>. Fara ea, aplicatia refuza sa porneasca.
/// </summary>
public class JwtOptions
{
    public const string SectionName = "Jwt";

    [Required]
    public string Issuer { get; init; } = "";

    [Required]
    public string Audience { get; init; } = "";

    /// <summary>Cheia HMAC-SHA256; cel putin 32 de octeti (256 de biti), altfel semnatura e slaba.</summary>
    [Required, MinLength(32)]
    public string Key { get; init; } = "";

    /// <summary>
    /// Cat traieste un token. Lung deliberat: un parinte la 3 noaptea nu trebuie sa se
    /// relogheze. Pretul: un token furat ramane valid pana expira (nu avem revocare).
    /// </summary>
    [Range(1, 365)]
    public int ExpiresInDays { get; init; } = 30;
}
