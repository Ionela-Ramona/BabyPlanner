import { Service, signal } from '@angular/core';

/**
 * Semnal global de "ceva s-a schimbat in activitati".
 *
 * Paginile Azi si Istoric includ `changes.version()` in parametrii lor
 * `rxResource` (in `params`), ca sa reincarce automat dupa orice
 * creare/editare/stergere — fara sa se aboneze fiecare pagina la fiecare
 * metoda de mutatie in parte. `ActivityLog` e singurul care apeleaza `notify()`.
 */
@Service()
export class ActivityChanges {
  private readonly versionState = signal(0);

  readonly version = this.versionState.asReadonly();

  notify(): void {
    this.versionState.update((value) => value + 1);
  }
}
