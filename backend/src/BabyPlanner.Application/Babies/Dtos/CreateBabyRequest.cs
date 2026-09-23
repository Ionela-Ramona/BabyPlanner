namespace BabyPlanner.Application.Babies.Dtos;

/// <summary>Datele necesare pentru a crea un bebelus.</summary>
public record CreateBabyRequest(string Name, DateOnly DateOfBirth);
