using BabyPlanner.Application.Activities.Dtos;
using BabyPlanner.Application.Common.Interfaces;

using FluentValidation;

namespace BabyPlanner.Application.Activities.Validators;

/// <summary>Regulile de validare la inregistrarea unei activitati.</summary>
public class CreateActivityRequestValidator : AbstractValidator<CreateActivityRequest>
{
    public CreateActivityRequestValidator(IDateTimeProvider dateTimeProvider)
    {
        RuleFor(a => a.Type)
            .IsInEnum().WithMessage("Tipul activitatii nu este valid.");

        RuleFor(a => a.OccurredAt)
            .NotEqual(default(DateTimeOffset)).WithMessage("Data si ora sunt obligatorii.")
            // Toleram cateva minute, ca un ceas de client putin inainte sa nu blocheze salvarea.
            .LessThanOrEqualTo(_ => dateTimeProvider.Now.AddMinutes(5))
            .WithMessage("Activitatea nu poate fi inregistrata in viitor.");

        RuleFor(a => a.Notes)
            .MaximumLength(500).WithMessage("Notitele nu pot depasi 500 de caractere.");
    }
}
