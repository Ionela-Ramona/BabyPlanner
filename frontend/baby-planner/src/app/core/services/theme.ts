import { DOCUMENT } from '@angular/common';
import { DestroyRef, Service, computed, effect, inject, signal } from '@angular/core';

/** Ce a ales utilizatorul. "system" = urmeaza setarea telefonului. */
export type ThemePreference = 'system' | 'light' | 'dark';

/** Tema care se vede efectiv acum. */
export type ResolvedTheme = 'light' | 'dark';

/** Aceeasi cheie o citeste scriptul inline din index.html, inainte de bootstrap. */
export const THEME_STORAGE_KEY = 'bp-theme';

/**
 * Culoarea hartiei in tema de zi. Fiecare valoare (in afara de "cream", implicita)
 * are un `@mixin background-<nume>` in styles/_tokens.scss si o regula in _themes.scss.
 */
export const BACKGROUNDS = ['cream', 'rose', 'mint', 'sky', 'lavender'] as const;

export type Background = (typeof BACKGROUNDS)[number];

/** Si pe aceasta o citeste scriptul inline din index.html. */
export const BACKGROUND_STORAGE_KEY = 'bp-background';

const DEFAULT_BACKGROUND: Background = 'cream';

function isBackground(value: unknown): value is Background {
  return BACKGROUNDS.includes(value as Background);
}

/**
 * Tema aplicatiei: combina preferinta sistemului cu alegerea explicita a utilizatorului.
 *
 * Alegerea explicita se scrie ca `data-theme` pe <html>; CSS-ul (styles/_themes.scss)
 * face restul. Pentru "system" scoatem atributul si lasam `prefers-color-scheme` sa decida,
 * asa ca tema se schimba singura seara daca telefonul trece pe dark.
 *
 * Tot aici sta si culoarea fundalului (`data-background`), pentru ca ambele schimba
 * --paper-ground, din care se calculeaza meta theme-color.
 */
@Service()
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly media = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');

  private readonly systemDark = signal(this.media?.matches ?? false);
  private readonly preferenceState = signal<ThemePreference>(this.readStored());
  private readonly backgroundState = signal<Background>(this.readStoredBackground());

  readonly preference = this.preferenceState.asReadonly();
  readonly background = this.backgroundState.asReadonly();

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
      this.apply(this.preferenceState(), this.backgroundState());
    });
  }

  set(preference: ThemePreference): void {
    this.preferenceState.set(preference);
    this.store(THEME_STORAGE_KEY, preference === 'system' ? null : preference);
  }

  setBackground(background: Background): void {
    this.backgroundState.set(background);
    this.store(BACKGROUND_STORAGE_KEY, background === DEFAULT_BACKGROUND ? null : background);
  }

  private store(key: string, value: string | null): void {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    } catch {
      // Stocarea poate fi blocata (mod privat); alegerea tot se aplica pentru sesiunea curenta.
    }
  }

  private apply(preference: ThemePreference, background: Background): void {
    const root = this.document.documentElement;
    if (preference === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', preference);
    }

    if (background === DEFAULT_BACKGROUND) {
      root.removeAttribute('data-background');
    } else {
      root.setAttribute('data-background', background);
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

  private readStoredBackground(): Background {
    try {
      const stored = localStorage.getItem(BACKGROUND_STORAGE_KEY);
      return isBackground(stored) ? stored : DEFAULT_BACKGROUND;
    } catch {
      return DEFAULT_BACKGROUND;
    }
  }
}
