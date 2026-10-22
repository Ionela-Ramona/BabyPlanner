import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Service, computed, inject, signal } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthResponse, Credentials } from '../models/auth';
import { ACTIVE_BABY_STORAGE_KEY } from './active-baby';
import { Clock } from './clock';

/** Cheia din localStorage sub care tinem sesiunea (token + email). */
export const AUTH_STORAGE_KEY = 'bp-auth';

/**
 * Sesiunea parintelui: token-ul JWT primit la login si cine e logat.
 *
 * Token-ul sta in localStorage, ca parintele sa ramana logat dupa ce inchide
 * telefonul (o sesiune in memorie s-ar pierde la fiecare reincarcare). Pretul:
 * un script strain rulat in pagina l-ar putea citi; de aceea pagina nu incarca
 * scripturi din afara si Angular escapeaza tot ce afiseaza.
 */
@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly clock = inject(Clock);
  private readonly document = inject(DOCUMENT);
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;

  private readonly session = signal<AuthResponse | null>(this.readStored());

  /** Token-ul de trimis la API; `null` daca nu e nimeni logat sau token-ul a expirat. */
  readonly token = computed(() => {
    const session = this.session();
    return session && Date.parse(session.expiresAt) > this.clock.now().getTime() ? session.token : null;
  });

  readonly isLoggedIn = computed(() => this.token() !== null);

  readonly email = computed(() => (this.isLoggedIn() ? this.session()!.email : null));

  login(credentials: Credentials): Observable<void> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, credentials)
      .pipe(map((response) => this.start(response)));
  }

  /** Contul nou e logat direct, fara un al doilea pas de login. */
  register(credentials: Credentials): Observable<void> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, credentials)
      .pipe(map((response) => this.start(response)));
  }

  /**
   * Iese din cont si reincarca aplicatia pe /login. Reincarcarea e deliberata: sterge
   * din memorie tot ce s-a incarcat pentru parintele asta (bebelusi, activitati), ca
   * urmatorul cont deschis pe acelasi telefon sa nu vada nimic din el nici o clipa.
   */
  logout(): void {
    this.session.set(null);
    for (const key of [AUTH_STORAGE_KEY, ACTIVE_BABY_STORAGE_KEY]) {
      try {
        localStorage.removeItem(key);
      } catch {
        // Stocarea poate fi blocata (mod privat); n-avem ce sterge.
      }
    }
    this.document.location.assign('/login');
  }

  private start(response: AuthResponse): void {
    this.session.set(response);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(response));
    } catch {
      // Fara stocare, sesiunea tine pana la reincarcarea paginii.
    }
  }

  private readStored(): AuthResponse | null {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      const parsed: Partial<AuthResponse> | null = raw ? JSON.parse(raw) : null;
      return typeof parsed?.token === 'string' &&
        typeof parsed.expiresAt === 'string' &&
        typeof parsed.email === 'string'
        ? (parsed as AuthResponse)
        : null;
    } catch {
      return null;
    }
  }
}
