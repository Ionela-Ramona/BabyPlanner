using BabyPlanner.Application.Activities.Dtos;
using BabyPlanner.Application.Common.Interfaces;

using FluentValidation;

namespace BabyPlanner.Application.Activities.Validators;

/// <summary>Regulile de validare la actualizarea unei activitati.</summary>
public class UpdateActivityRequestValidator : AbstractValidator<UpdateActivityRequest>
{
    public UpdateActivityRequestValidator(IDateTimeProvider dateTimeProvider)
    {
        RuleFor(a => a.Type)
            .IsInEnum().WithMessage("Tipul activitatii nu este valid.");

        RuleFor(a => a.OccurredAt)
            .NotEqual(default(DateTimeOffset)).WithMessage("Data si ora sunt obligatorii.")
            .LessThanOrEqualTo(_ => dateTimeProvider.Now.AddMinutes(5))
            .WithMessage("Activitatea nu poate fi inregistrata in viitor.");

        RuleFor(a => a.Notes)
            .MaximumLength(500).WithMessage("Notitele nu pot depasi 500 de caractere.");
    }
}
