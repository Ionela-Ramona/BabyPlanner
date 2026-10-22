using BabyPlanner.Domain.Entities;

namespace BabyPlanner.Application.Common.Interfaces;

/// <summary>
/// Emite token-ul de acces dupa login. Interfata sta aici, implementarea (JWT) in Api,
/// langa configurarea care il verifica la fiecare cerere — cheia si emitentul sunt
/// intr-un singur loc.
/// </summary>
public interface ITokenGenerator
{
    (string Token, DateTimeOffset ExpiresAt) Generate(User user);
}
