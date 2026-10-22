namespace BabyPlanner.Application.Common.Interfaces;

/// <summary>
/// Parintele care face cererea curenta, citit din token-ul JWT. Implementarea sta in
/// Api (acolo exista HttpContext); Application si Infrastructure vad doar id-ul.
/// </summary>
public interface ICurrentUser
{
    /// <summary><c>null</c> cand cererea nu e autentificata (sau in afara unei cereri HTTP, ca la seed).</summary>
    int? UserId { get; }
}
