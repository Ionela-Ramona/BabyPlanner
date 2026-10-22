import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth';

/**
 * Pune token-ul pe fiecare cerere catre API, ca serviciile (BabyApi, ActivityApi)
 * sa nu stie nimic despre autentificare.
 *
 * Un 401 la o cerere care avea token inseamna ca token-ul nu mai e bun (expirat,
 * cheie schimbata pe server): iesim din cont. Un 401 fara token e doar o parola
 * gresita la login, pe care o arata formularul.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const token = auth.token();

  // Doar spre API-ul nostru: token-ul nu pleaca niciodata catre alt domeniu.
  if (!token || !request.url.startsWith(environment.apiBaseUrl)) {
    return next(request);
  }

  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        auth.logout();
      }
      return throwError(() => error);
    }),
  );
};
