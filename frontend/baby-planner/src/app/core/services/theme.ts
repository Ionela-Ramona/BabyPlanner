import { DOCUMENT } from '@angular/common';
import { DestroyRef, Service, computed, effect, inject, signal } from '@angular/core';

/** Ce a ales utilizatorul. "system" = urmeaza setarea telefonului. */
export type ThemePreference = 'system' | 'light' | 'dark';

/** Tema care se vede efectiv acum. */
export type ResolvedTheme = 'light' | 'dark';

/** Aceeasi cheie o citeste scriptul inline din index.html, inainte de bootstrap. */
export const THEME_STORAGE_KEY = 'bp-theme';

/**
 * Tema aplicatiei: combina preferinta sistemului cu alegerea explicita a utilizatorului.
 *
 * Alegerea explicita se scrie ca `data-theme` pe <html>; CSS-ul (styles/_themes.scss)
 * face restul. Pentru "system" scoatem atributul si lasam `prefers-color-scheme` sa decida,
 * asa ca tema se schimba singura seara daca telefonul trece pe dark.
 */
@Service()
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly media = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');

  private readonly systemDark = signal(this.media?.matches ?? false);
  private readonly preferenceState = signal<ThemePreference>(this.readStored());

  readonly preference = this.preferenceState.asReadonly();

  readonly resolved = computed<ResolvedTheme>(() => {
    const preference = this.preferenceState();
    if (preference === 'system') {
      return this.systemDark() ? 'dark' : 'light';
    }
    return preference;
  });

  constructor() {
    const listener = (event: MediaQueryListEvent) => this.systemDark.set(event.matches);
    this.media?.addEventListener?.('change', listener);
    inject(DestroyRef).onDestroy(() => this.media?.removeEventListener?.('change', listener));

    // Depinde si de `resolved`: cand telefonul trece singur pe dark, culoarea din
    // meta theme-color trebuie recitita chiar daca preferinta ramane "system".
    effect(() => {
      this.resolved();
      this.apply(this.preferenceState());
    });
  }

  set(preference: ThemePreference): void {
    this.preferenceState.set(preference);
    try {
      if (preference === 'system') {
        localStorage.removeItem(THEME_STORAGE_KEY);
      } else {
        localStorage.setItem(THEME_STORAGE_KEY, preference);
      }
    } catch {
      // Stocarea poate fi blocata (mod privat); tema tot se aplica pentru sesiunea curenta.
    }
  }

  private apply(preference: ThemePreference): void {
    const root = this.document.documentElement;
    if (preference === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', preference);
    }

    // Toate meta theme-color primesc culoarea temei efective; altfel browserul ar alege
    // dupa `media` si bara de sus ar ramane deschisa cand utilizatorul a ales "Noapte".
    // Culoarea o citim din CSS (--paper-ground), ca sa nu existe o a doua sursa de adevar.
    const ground = this.document.defaultView
      ?.getComputedStyle(root)
      .getPropertyValue('--paper-ground')
      .trim();
    if (ground) {
      this.document
        .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
        .forEach((meta) => meta.setAttribute('content', ground));
    }
  }

  private readStored(): ThemePreference {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      return stored === 'light' || stored === 'dark' ? stored : 'system';
    } catch {
      return 'system';
    }
  }
}
