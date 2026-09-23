using BabyPlanner.Application.Babies.Dtos;
using BabyPlanner.Domain.Entities;

namespace BabyPlanner.Application.Babies.Mapping;

/// <summary>
/// Conversiile intre entitate si DTO-uri, scrise de mana.
/// Preferam extension methods in locul unei librarii de mapping: vezi exact ce se
/// intampla, nu ai surprize la runtime si e mai putin cod la scara asta.
/// </summary>
public static class BabyMappings
{
    public static BabyDto ToDto(this Baby baby) =>
        new(baby.Id, baby.Name, baby.DateOfBirth);

    public static Baby ToEntity(this CreateBabyRequest request) =>
        new()
        {
            Name = request.Name.Trim(),
            DateOfBirth = request.DateOfBirth
        };

    /// <summary>Copiaza valorile din cerere peste o entitate urmarita de EF Core.</summary>
    public static void ApplyTo(this UpdateBabyRequest request, Baby baby)
    {
        baby.Name = request.Name.Trim();
        baby.DateOfBirth = request.DateOfBirth;
    }
}
