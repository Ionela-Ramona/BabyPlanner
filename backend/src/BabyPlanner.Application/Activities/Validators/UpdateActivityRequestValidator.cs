using BabyPlanner.Application.Activities.Dtos;
using BabyPlanner.Application.Common.Interfaces;

using FluentValidation;

namespace BabyPlanner.Application.Activities.Validators;

/// <summary>Regulile de validare la actualizarea unei activitati (vezi <see cref="ActivityRules"/>).</summary>
public class UpdateActivityRequestValidator : AbstractValidator<UpdateActivityRequest>
{
    public UpdateActivityRequestValidator(IDateTimeProvider dateTimeProvider)
    {
        this.AddActivityRules(dateTimeProvider);
    }
}
