using BabyPlanner.Application.Babies.Dtos;
using BabyPlanner.Application.Common.Interfaces;

using FluentValidation;

namespace BabyPlanner.Application.Babies.Validators;

/// <summary>Regulile de validare la crearea unui bebelus.</summary>
public class CreateBabyRequestValidator : AbstractValidator<CreateBabyRequest>
{
    public CreateBabyRequestValidator(IDateTimeProvider dateTimeProvider)
    {
        RuleFor(b => b.Name)
            .NotEmpty().WithMessage("Numele este obligatoriu.")
            .MaximumLength(100).WithMessage("Numele nu poate depasi 100 de caractere.");

        // Data nasterii nu poate fi in viitor; folosim sursa de timp injectata.
        RuleFor(b => b.DateOfBirth)
            .LessThanOrEqualTo(_ => DateOnly.FromDateTime(dateTimeProvider.Now.Date))
            .WithMessage("Data nasterii nu poate fi in viitor.");
    }
}
