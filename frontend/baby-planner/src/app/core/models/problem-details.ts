/**
 * Formatul erorilor intoarse de API (RFC 7807), produs de
 * ExceptionHandlingMiddleware din backend.
 */
export interface ProblemDetails {
  readonly type?: string;
  readonly title?: string;
  readonly status?: number;
  readonly detail?: string;
  readonly instance?: string;
}

/**
 * Varianta pentru erorile de validare: in plus fata de ProblemDetails, are un
 * dictionar camp -> lista de mesaje.
 */
export interface ValidationProblemDetails extends ProblemDetails {
  readonly errors: Readonly<Record<string, readonly string[]>>;
}

/** Distinge cele doua forme de 400 pe care le poate intoarce API-ul. */
export function isValidationProblem(
  problem: ProblemDetails | null | undefined,
): problem is ValidationProblemDetails {
  return !!problem && typeof (problem as ValidationProblemDetails).errors === 'object';
}
