import { Component, booleanAttribute, input } from '@angular/core';

/**
 * Wordmark-ul aplicatiei: steaua somnoroasa + "BabyPlanner" in doua voci
 * ("Baby" cu litera de titluri, "Planner" in scriptul de pensula).
 *
 * Tot ce e desenat (stea, litere) e `aria-hidden`; numele accesibil vine dintr-un
 * span ascuns vizual care spune "BabyPlanner" dintr-o bucata, ca un cititor de
 * ecran sa nu auda un spatiu care nu exista in numele produsului.
 *
 * `compact`: doar steaua (pentru bara de sus pe telefon foarte ingust); textul
 * ascuns vizual ramane, deci numele accesibil nu se schimba.
 */
@Component({
  selector: 'app-wordmark',
  host: { class: 'wordmark' },
  template: `
    <svg class="wordmark__star" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        class="wordmark__star-body"
        d="M11.29 4.95 Q12 3.1 12.71 4.95 L13.65 7.41 Q14.35 9.26 16.33 9.36 L18.96 9.5
           Q20.94 9.6 19.4 10.84 L17.34 12.49 Q15.8 13.74 16.32 15.65 L17.01 18.19
           Q17.53 20.1 15.87 19.02 L13.66 17.58 Q12 16.5 10.34 17.58 L8.13 19.02
           Q6.47 20.1 6.99 18.19 L7.68 15.65 Q8.2 13.74 6.66 12.49 L4.6 10.84
           Q3.06 9.6 5.04 9.5 L7.67 9.36 Q9.65 9.26 10.35 7.41 Z"
      />
      <path class="wordmark__star-face" d="M8.8 12.6 Q9.8 11.7 10.8 12.6" />
      <path class="wordmark__star-face" d="M13.2 12.6 Q14.2 11.7 15.2 12.6" />
      <path class="wordmark__star-face" d="M9.3 16.8 Q12 18.8 14.7 16.8" />
    </svg>

    @if (!compact()) {
      <span class="wordmark__word" aria-hidden="true">
        <span class="wordmark__baby">Baby</span
        ><span class="wordmark__planner script">Planner</span>
      </span>
    }

    <span class="visually-hidden">BabyPlanner</span>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      height: 2rem;
      line-height: 1;
    }

    .wordmark__star {
      flex: none;
      width: 1.75rem;
      height: 1.75rem;
      overflow: visible;
    }

    .wordmark__star-body {
      fill: var(--honey-fill);
      stroke: var(--honey-line);
      stroke-width: 1;
      stroke-linejoin: round;
    }

    .wordmark__star-face {
      fill: none;
      stroke: var(--ink);
      stroke-width: 1.25;
      stroke-linecap: round;
    }

    .wordmark__word {
      display: inline-flex;
      align-items: baseline;
      gap: 0.1875rem;
    }

    .wordmark__baby {
      color: var(--color-text-strong);
      font-family: var(--font-display);
      font-size: 1.375rem;
      font-weight: 600;
      line-height: 1;
    }

    .wordmark__planner {
      color: var(--blush-ink);
      font-size: 1.625rem;
    }
  `,
})
export class Wordmark {
  /** Doar steaua, fara text vizibil (numele accesibil ramane "BabyPlanner"). */
  readonly compact = input(false, { transform: booleanAttribute });
}
