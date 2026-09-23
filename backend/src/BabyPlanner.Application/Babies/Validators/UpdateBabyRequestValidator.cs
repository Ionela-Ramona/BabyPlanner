using BabyPlanner.Application.Babies.Dtos;
using BabyPlanner.Application.Common.Interfaces;

using FluentValidation;

namespace BabyPlanner.Application.Babies.Validators;

/// <summary>Regulile de validare la actualizarea unui bebelus.</summary>
public class UpdateBabyRequestValidator : AbstractValidator<UpdateBabyRequest>
{
    public UpdateBabyRequestValidator(IDateTimeProvider dateTimeProvider)
    {
        RuleFor(b => b.Name)
            .NotEmpty().WithMessage("Numele este obligatoriu.")
            .MaximumLength(100).WithMessage("Numele nu poate depasi 100 de caractere.");

        RuleFor(b => b.DateOfBirth)
            .LessThanOrEqualTo(_ => DateOnly.FromDateTime(dateTimeProvider.Now.Date))
            .WithMessage("Data nasterii nu poate fi in viitor.");
    }
}
