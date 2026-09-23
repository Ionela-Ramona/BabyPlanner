namespace BabyPlanner.Application.Babies.Dtos;

/// <summary>Datele modificabile ale unui bebelus. Id-ul vine din ruta, nu din corp.</summary>
public record UpdateBabyRequest(string Name, DateOnly DateOfBirth);
