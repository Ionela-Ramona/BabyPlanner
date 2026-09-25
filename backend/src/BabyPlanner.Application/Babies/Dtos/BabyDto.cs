namespace BabyPlanner.Application.Babies.Dtos;

/// <summary>Bebelusul asa cum este expus catre exterior (API).</summary>
public record BabyDto(int Id, string Name, DateOnly DateOfBirth);
