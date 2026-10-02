using BabyPlanner.Application.Activities.Dtos;
using BabyPlanner.Application.Common.Interfaces;

using FluentValidation;

namespace BabyPlanner.Application.Activities.Validators;

/// <summary>Regulile de validare la inregistrarea unei activitati (vezi <see cref="ActivityRules"/>).</summary>
public class CreateActivityRequestValidator : AbstractValidator<CreateActivityRequest>
{
    public CreateActivityRequestValidator(IDateTimeProvider dateTimeProvider)
    {
        this.AddActivityRules(dateTimeProvider);
    }
}
