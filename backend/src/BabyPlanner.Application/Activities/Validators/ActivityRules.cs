using BabyPlanner.Application.Activities.Dtos;
using BabyPlanner.Application.Common.Interfaces;
using BabyPlanner.Domain.Enums;

using FluentValidation;

namespace BabyPlanner.Application.Activities.Validators;

/// <summary>
/// Regulile comune pentru creare si editare. Stau intr-un singur loc ca cele doua
/// validatoare sa nu se poata desincroniza.
/// </summary>
public static class ActivityRules
{
    public const int MaxNotesLength = 500;
    public const int MinAmountMl = 1;
    public const int MaxAmountMl = 500;
    public const int MinDurationMinutes = 1;

    /// <summary>O zi intreaga: un somn sau o alaptare mai lunga e aproape sigur o greseala de tastare.</summary>
    public const int MaxDurationMinutes = 24 * 60;

    public static void AddActivityRules<T>(this AbstractValidator<T> validator, IDateTimeProvider dateTimeProvider)
        where T : IActivityDetails
    {
        validator.RuleFor(a => a.Type)
            .IsInEnum().WithMessage("Tipul activitatii nu este valid.");

        validator.RuleFor(a => a.OccurredAt)
            .NotEqual(default(DateTimeOffset)).WithMessage("Data si ora sunt obligatorii.")
            // Toleram cateva minute, ca un ceas de client putin inainte sa nu blocheze salvarea.
            .LessThanOrEqualTo(_ => dateTimeProvider.Now.AddMinutes(5))
            .WithMessage("Activitatea nu poate fi inregistrata in viitor.");

        validator.RuleFor(a => a.Notes)
            .MaximumLength(MaxNotesLength).WithMessage($"Notitele nu pot depasi {MaxNotesLength} de caractere.");

        // Fiecare detaliu are sens doar pentru anumite tipuri. Il refuzam in rest, in loc
        // sa-l ignoram, ca un client gresit sa afle imediat, nu dupa ce totalurile ies ciudat.
        validator.RuleFor(a => a.AmountMl)
            .InclusiveBetween(MinAmountMl, MaxAmountMl)
            .WithMessage($"Cantitatea trebuie sa fie intre {MinAmountMl} si {MaxAmountMl} ml.")
            .Must((request, _) => request.Type == ActivityType.Feeding)
            .WithMessage("Cantitatea se poate nota doar la masa.")
            .When(a => a.AmountMl is not null);

        validator.RuleFor(a => a.DurationMinutes)
            .InclusiveBetween(MinDurationMinutes, MaxDurationMinutes)
            .WithMessage($"Durata trebuie sa fie intre {MinDurationMinutes} si {MaxDurationMinutes} de minute.")
            .Must((request, _) => request.Type is ActivityType.Sleep or ActivityType.Feeding)
            .WithMessage("Durata se poate nota doar la somn sau la masa.")
            .Must((request, _) => !request.InProgress)
            .WithMessage("Un somn care inca dureaza nu are inca durata.")
            .When(a => a.DurationMinutes is not null);

        validator.RuleFor(a => a.DiaperKind)
            .IsInEnum().WithMessage("Tipul scutecului nu este valid.")
            .Must((request, _) => request.Type == ActivityType.Diaper)
            .WithMessage("Tipul scutecului se poate nota doar la scutec.")
            .When(a => a.DiaperKind is not null);

        validator.RuleFor(a => a.InProgress)
            .Must((request, _) => request.Type == ActivityType.Sleep)
            .WithMessage("Doar un somn poate fi in desfasurare.")
            .When(a => a.InProgress);
    }
}
