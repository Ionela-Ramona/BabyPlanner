import { HttpErrorResponse } from '@angular/common/http';

import { ProblemDetails, isValidationProblem } from '../../core/models/problem-details';

/** Aratat cand cererea nici macar n-a ajuns la server (offline, CORS, server oprit). */
export const NETWORK_ERROR_MESSAGE =
  'Nu am putut ajunge la server. Verifică conexiunea și încearcă din nou.';

/** Fallback pentru un ProblemDetails fara `detail` si fara `title`. */
export const GENERIC_ERROR_MESSAGE = 'A apărut o eroare neașteptată. Încearcă din nou.';

export interface MappedProblem {
  /** Cheia e numele local al campului (camelCase); lista, mesajele in romana ale API-ului. */
  readonly fieldErrors: Record<string, string[]>;
  /** Eroare care nu tine de un camp anume (afisata intr-un `app-error-state` la nivel de formular). */
  readonly formError: string | null;
}

/**
 * Traduce un raspuns de eroare HTTP (RFC 7807) in erori gata de afisat langa fiecare
 * `app-field`. Accepta fie un `HttpErrorResponse` (cazul obisnuit, direct din `catchError`),
 * fie un `ProblemDetails`/`ValidationProblemDetails` deja extras, fie orice altceva.
 *
 * Cheile serverului sunt PascalCase (`Name`, `DateOfBirth`, `OccurredAt`) sau cai de forma
 * `"$.occurredAt"` / `"request.Name"` (validatoare care descriu o cale, nu doar un nume de
 * proprietate). Luam ultima portiune a caii si o coboram la camelCase, ca sa se potriveasca
 * numele campurilor din formular. `fieldMap` suprascrie regula implicita cand serverul si
 * formularul difera (ex. un camp calculat sau redenumit).
 */
export function mapProblemToFields(
  problem: unknown,
  fieldMap: Readonly<Record<string, string>> = {},
): MappedProblem {
  if (problem instanceof HttpErrorResponse) {
    // status 0 = cererea n-a ajuns la server (retea cazuta, CORS, server oprit).
    if (problem.status === 0) {
      return { fieldErrors: {}, formError: NETWORK_ERROR_MESSAGE };
    }
    return mapProblemToFields(problem.error, fieldMap);
  }

  if (isValidationProblem(problem as ProblemDetails | null | undefined)) {
    const validation = problem as { errors: Record<string, readonly string[]> };
    const fieldErrors: Record<string, string[]> = {};

    for (const [rawKey, messages] of Object.entries(validation.errors)) {
      const key = normalizeFieldKey(rawKey, fieldMap);
      fieldErrors[key] = [...(fieldErrors[key] ?? []), ...messages];
    }

    return { fieldErrors, formError: null };
  }

  if (isProblemDetails(problem)) {
    return { fieldErrors: {}, formError: problem.detail ?? problem.title ?? GENERIC_ERROR_MESSAGE };
  }

  return { fieldErrors: {}, formError: GENERIC_ERROR_MESSAGE };
}

function isProblemDetails(value: unknown): value is ProblemDetails {
  return (
    !!value &&
    typeof value === 'object' &&
    ('title' in value || 'detail' in value || 'status' in value)
  );
}

/** "Name" -> "name"; "$.occurredAt" / "request.Name" -> ultima portiune, camelCase. */
function normalizeFieldKey(rawKey: string, fieldMap: Readonly<Record<string, string>>): string {
  if (fieldMap[rawKey]) {
    return fieldMap[rawKey];
  }

  const segments = rawKey.split(/[.[\]$]/).filter(Boolean);
  const last = segments.at(-1) ?? rawKey;

  if (fieldMap[last]) {
    return fieldMap[last];
  }

  return last.length ? last[0].toLowerCase() + last.slice(1) : last;
}
