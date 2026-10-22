using BabyPlanner.Application.Auth.Dtos;

using FluentValidation;

namespace BabyPlanner.Application.Auth.Validators;

/// <summary>Regulile pentru un cont nou. Mesajele ajung direct sub campurile din Angular.</summary>
public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    /// <summary>Aceeasi limita ca in UserConfiguration.</summary>
    public const int EmailMaxLength = 256;

    public const int PasswordMinLength = 8;

    public RegisterRequestValidator()
    {
        RuleFor(r => r.Email)
            .NotEmpty().WithMessage("Emailul este obligatoriu.")
            .MaximumLength(EmailMaxLength).WithMessage($"Emailul nu poate depăși {EmailMaxLength} de caractere.")
            .EmailAddress().WithMessage("Emailul nu pare valid.");

        // Lungimea conteaza mai mult decat regulile de tip "o cifra si un simbol" (NIST 800-63B).
        // Maximul exista doar ca nimeni sa nu trimita un megabyte de "parola" la PBKDF2.
        RuleFor(r => r.Password)
            .NotEmpty().WithMessage("Parola este obligatorie.")
            .MinimumLength(PasswordMinLength).WithMessage($"Parola trebuie să aibă cel puțin {PasswordMinLength} caractere.")
            .MaximumLength(128).WithMessage("Parola nu poate depăși 128 de caractere.");
    }
}

/// <summary>La login verificam doar ca exista ceva; regulile de format sunt treaba inregistrarii.</summary>
public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(r => r.Email).NotEmpty().WithMessage("Emailul este obligatoriu.");
        RuleFor(r => r.Password).NotEmpty().WithMessage("Parola este obligatorie.");
    }
}
