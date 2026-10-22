import { DOCUMENT } from '@angular/common';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';

import { authGuard, guestGuard } from '../guards/auth.guard';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { AuthResponse } from '../models/auth';
import { provideFakeClock } from '../testing/fake-clock';
import { ACTIVE_BABY_STORAGE_KEY } from './active-baby';
import { AUTH_STORAGE_KEY, AuthService } from './auth';

const SESSION: AuthResponse = { token: 'abc', email: 'ana@test.ro', expiresAt: '2026-10-21T10:00:00Z' };

describe('AuthService, authInterceptor and the guards', () => {
  let assign: ReturnType<typeof vi.fn>;

  function setup(stored: AuthResponse | null = null) {
    localStorage.clear();
    if (stored) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(stored));
    }
    assign = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        provideFakeClock(new Date('2026-10-20T10:00:00Z')).provider,
        // logout() reincarca pagina; in teste doar inregistram unde ar merge.
        { provide: DOCUMENT, useValue: { location: { assign } } },
      ],
    });
    return {
      auth: TestBed.inject(AuthService),
      http: TestBed.inject(HttpClient),
      httpMock: TestBed.inject(HttpTestingController),
    };
  }

  const runGuard = (guard: typeof authGuard) =>
    TestBed.runInInjectionContext(() => guard(undefined!, undefined!)) as boolean | UrlTree;

  afterEach(() => localStorage.clear());

  it('logs in, keeps the session across reloads and sends the token to the API only', async () => {
    const { auth, http, httpMock } = setup();

    const done = firstValueFrom(auth.login({ email: 'ana@test.ro', password: 'parola-buna' }));
    httpMock.expectOne({ method: 'POST', url: '/api/auth/login' }).flush(SESSION);
    await done;

    expect(auth.isLoggedIn()).toBe(true);
    expect(auth.email()).toBe('ana@test.ro');
    expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)!)).toEqual(SESSION);

    http.get('/api/babies').subscribe();
    http.get('https://alt-site.ro/api/babies').subscribe();
    expect(httpMock.expectOne('/api/babies').request.headers.get('Authorization')).toBe('Bearer abc');
    expect(httpMock.expectOne('https://alt-site.ro/api/babies').request.headers.has('Authorization')).toBe(false);
  });

  it('treats an expired stored token as logged out', () => {
    const { auth } = setup({ ...SESSION, expiresAt: '2026-10-19T10:00:00Z' });

    expect(auth.isLoggedIn()).toBe(false);
    expect(auth.token()).toBeNull();
  });

  it('logs out on a 401 to a request that carried a token, and forgets the active baby', () => {
    const { http, httpMock } = setup(SESSION);
    localStorage.setItem(ACTIVE_BABY_STORAGE_KEY, '3');

    http.get('/api/babies').subscribe({ error: () => undefined });
    httpMock.expectOne('/api/babies').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(assign).toHaveBeenCalledWith('/login');
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(ACTIVE_BABY_STORAGE_KEY)).toBeNull();
  });

  it('does not log out on a wrong password (a 401 without a token)', () => {
    const { auth, httpMock } = setup();

    auth.login({ email: 'ana@test.ro', password: 'gresita' }).subscribe({ error: () => undefined });
    httpMock.expectOne('/api/auth/login').flush({ detail: 'Email sau parolă greșită.' }, { status: 401, statusText: 'Unauthorized' });

    expect(assign).not.toHaveBeenCalled();
  });

  it('sends a logged-out parent to /login, and a logged-in one away from it', () => {
    setup();
    const router = TestBed.inject(Router);
    expect(router.serializeUrl(runGuard(authGuard) as UrlTree)).toBe('/login');
    expect(runGuard(guestGuard)).toBe(true);

    TestBed.resetTestingModule();
    setup(SESSION);
    expect(runGuard(authGuard)).toBe(true);
    expect(TestBed.inject(Router).serializeUrl(runGuard(guestGuard) as UrlTree)).toBe('/dashboard');
  });
});
