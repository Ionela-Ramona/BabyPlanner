using BabyPlanner.Application.Common.Exceptions;

using Microsoft.AspNetCore.Mvc;

using FluentValidationException = FluentValidation.ValidationException;

namespace BabyPlanner.Api.Middleware;

/// <summary>
/// Transforma exceptiile aplicatiei in raspunsuri ProblemDetails (RFC 7807).
/// Exista ca sa nu avem try/catch in controllere: serviciile arunca exceptii cu
/// inteles de business, iar traducerea in cod HTTP se face intr-un singur loc.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (NotFoundException ex)
        {
            await WriteProblemAsync(context, StatusCodes.Status404NotFound, "Resursa nu a fost gasita", ex.Message);
        }
        catch (FluentValidationException ex)
        {
            var errors = ex.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());

            var problem = new ValidationProblemDetails(errors)
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Date de intrare invalide",
                Instance = context.Request.Path
            };

            await WriteAsync(context, problem);
        }
        catch (Exception ex)
        {
            // Detaliile raman in loguri; clientul primeste un mesaj generic.
            _logger.LogError(ex, "Eroare netratata la {Method} {Path}", context.Request.Method, context.Request.Path);

            await WriteProblemAsync(
                context,
                StatusCodes.Status500InternalServerError,
                "Eroare interna",
                "A aparut o eroare neasteptata.");
        }
    }

    private static Task WriteProblemAsync(HttpContext context, int statusCode, string title, string detail)
    {
        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path
        };

        return WriteAsync(context, problem);
    }

    private static async Task WriteAsync(HttpContext context, ProblemDetails problem)
    {
        if (context.Response.HasStarted)
        {
            // Raspunsul a inceput deja; nu-l mai putem rescrie.
            return;
        }

        context.Response.Clear();
        context.Response.StatusCode = problem.Status ?? StatusCodes.Status500InternalServerError;
        // Tipul standard pentru ProblemDetails, nu application/json simplu.
        context.Response.ContentType = "application/problem+json";

        // Trimitem si tipul concret: altfel ValidationProblemDetails s-ar serializa ca
        // ProblemDetails simplu si s-ar pierde dictionarul de erori.
        await context.Response.WriteAsJsonAsync(problem, problem.GetType());
    }
}
