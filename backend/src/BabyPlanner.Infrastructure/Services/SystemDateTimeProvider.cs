using BabyPlanner.Application.Common.Interfaces;

namespace BabyPlanner.Infrastructure.Services;

/// <summary>Sursa reala de timp: ceasul sistemului.</summary>
public class SystemDateTimeProvider : IDateTimeProvider
{
    public DateTimeOffset Now => DateTimeOffset.Now;
}
