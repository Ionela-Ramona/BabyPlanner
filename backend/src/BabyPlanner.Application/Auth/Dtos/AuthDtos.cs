namespace BabyPlanner.Application.Auth.Dtos;

/// <summary>Crearea unui cont nou.</summary>
public record RegisterRequest(string Email, string Password);

/// <summary>Autentificarea cu un cont existent.</summary>
public record LoginRequest(string Email, string Password);

/// <summary>Raspunsul la login si la inregistrare: token-ul pe care Angular il trimite la fiecare cerere.</summary>
public record AuthResponse(string Token, DateTimeOffset ExpiresAt, string Email);
