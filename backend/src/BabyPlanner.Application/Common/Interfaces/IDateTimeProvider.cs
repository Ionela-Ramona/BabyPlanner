namespace BabyPlanner.Application.Common.Interfaces;

/// <summary>
/// Sursa de timp a aplicatiei. Exista ca sa putem controla "acum" in teste —
/// altfel logica de tip "activitatile de azi" ar depinde de ceasul masinii.
/// </summary>
public interface IDateTimeProvider
{
    DateTimeOffset Now { get; }
}
