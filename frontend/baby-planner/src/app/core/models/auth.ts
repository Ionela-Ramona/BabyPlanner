/** POST /api/auth/login si /api/auth/register (LoginRequest / RegisterRequest din backend). */
export interface Credentials {
  readonly email: string;
  readonly password: string;
}

/** Raspunsul la login si inregistrare (AuthResponse din backend). */
export interface AuthResponse {
  readonly token: string;
  /** ISO 8601, de ex. "2026-11-20T21:04:00+00:00". */
  readonly expiresAt: string;
  readonly email: string;
}
