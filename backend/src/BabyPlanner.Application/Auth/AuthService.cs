using BabyPlanner.Application.Auth.Dtos;
using BabyPlanner.Application.Common.Exceptions;
using BabyPlanner.Application.Common.Interfaces;
using BabyPlanner.Domain.Entities;

using FluentValidation;
using FluentValidation.Results;

using Microsoft.AspNetCore.Identity;

namespace BabyPlanner.Application.Auth;

/// <summary>Cazurile de utilizare pentru conturi.</summary>
public interface IAuthService
{
    /// <exception cref="ValidationException">Date invalide sau email deja folosit.</exception>
    Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);

    /// <exception cref="UnauthorizedException">Email sau parola gresita.</exception>
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
}

/// <summary>
/// Inregistrare si login. Parola nu se salveaza: pastram doar hash-ul produs de
/// <see cref="IPasswordHasher{TUser}"/> din ASP.NET Identity (PBKDF2 cu sare), nu un
/// algoritm scris de mana — criptografia "facuta acasa" e locul unde se gresesc lucrurile.
/// </summary>
public class AuthService : IAuthService
{
    /// <summary>Acelasi mesaj pentru email necunoscut si parola gresita: nu spunem cine are cont.</summary>
    private const string InvalidCredentials = "Email sau parolă greșită.";

    private readonly IUserRepository _users;
    private readonly IPasswordHasher<User> _hasher;
    private readonly ITokenGenerator _tokens;
    private readonly IValidator<RegisterRequest> _registerValidator;
    private readonly IValidator<LoginRequest> _loginValidator;

    public AuthService(
        IUserRepository users,
        IPasswordHasher<User> hasher,
        ITokenGenerator tokens,
        IValidator<RegisterRequest> registerValidator,
        IValidator<LoginRequest> loginValidator)
    {
        _users = users;
        _hasher = hasher;
        _tokens = tokens;
        _registerValidator = registerValidator;
        _loginValidator = loginValidator;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        await _registerValidator.ValidateAndThrowAsync(request, cancellationToken);

        var email = Normalize(request.Email);
        if (await _users.GetByEmailAsync(email, cancellationToken) is not null)
        {
            // Aceeasi forma ca orice eroare de validare: Angular o pune sub campul Email.
            throw new ValidationException([new ValidationFailure(nameof(request.Email), "Există deja un cont cu acest email.")]);
        }

        var user = new User { Email = email, PasswordHash = "" };
        user.PasswordHash = _hasher.HashPassword(user, request.Password);
        await _users.AddAsync(user, cancellationToken);

        return CreateResponse(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        await _loginValidator.ValidateAndThrowAsync(request, cancellationToken);

        var user = await _users.GetByEmailAsync(Normalize(request.Email), cancellationToken);
        if (user is null
            || _hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password) == PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedException(InvalidCredentials);
        }

        return CreateResponse(user);
    }

    public static string Normalize(string email) => email.Trim().ToLowerInvariant();

    private AuthResponse CreateResponse(User user)
    {
        var (token, expiresAt) = _tokens.Generate(user);
        return new AuthResponse(token, expiresAt, user.Email);
    }
}
