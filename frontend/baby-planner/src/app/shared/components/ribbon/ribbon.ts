import { Component, booleanAttribute, input } from '@angular/core';

import { Icon } from '../icon/icon';

export type RibbonSize = 'sm' | 'md';

/**
 * Panglica "♡ Big Memories ♡" din imaginea de referinta: o banda de nisip cu
 * capetele crestate, pentru antetele de zi ("Azi · joi, 25 septembrie") si etichete de sectiune.
 *
 * Textul e text real, proiectat; semantica o da apelantul (poate imbraca un `<h2>`).
 * Forma e un singur strat decupat cu un poligon de 6 puncte (crestaturile), cu
 * capetele putin mai inchise, ca si cum ar fi indoite in spatele benzii.
 * `decorated` adauga cate o inimioara decorativa (aria-hidden) de fiecare parte.
 */
@Component({
  selector: 'app-ribbon',
  imports: [Icon],
  host: {
    class: 'ribbon',
    '[class.ribbon--sm]': "size() === 'sm'",
    '[class.ribbon--md]': "size() === 'md'",
  },
  template: `
    <span class="ribbon__shape" aria-hidden="true"><span class="ribbon__band"></span></span>
    @if (decorated()) {
      <app-icon class="ribbon__heart" name="heart" [size]="14" />
    }
    <span class="ribbon__text"><ng-content /></span>
    @if (decorated()) {
      <app-icon class="ribbon__heart" name="heart" [size]="14" />
    }
  `,
  styles: `
    :host {
      --tail: 0.8125rem;
      --notch: 0.625rem;

      position: relative;
      z-index: 0;
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      min-height: 2.25rem;
      max-width: 100%;
      padding: 0.25rem calc(var(--tail) + var(--space-3));
      color: var(--color-text-strong);
      font: 600 var(--text-body) / 1.25 var(--font-sans);
      letter-spacing: 0.01em;
      vertical-align: middle;
    }

    :host(.ribbon--sm) {
      --tail: 0.625rem;
      --notch: 0.5rem;

      gap: var(--space-1);
      min-height: 1.75rem;
      padding-block: 0.125rem;
      padding-inline: calc(var(--tail) + var(--space-2));
      font-size: var(--text-small);
    }

    /* Umbra pe un strat separat: drop-shadow urmeaza crestaturile, iar textul ramane fara umbra. */
    .ribbon__shape {
      position: absolute;
      inset: 0;
      z-index: -1;
      filter: drop-shadow(0 1px 1.5px rgb(var(--shadow-rgb) / 20%));
    }

    .ribbon__band {
      position: absolute;
      inset: 0;
      clip-path: polygon(
        0 0,
        100% 0,
        calc(100% - var(--notch)) 50%,
        100% 100%,
        0 100%,
        var(--notch) 50%
      );
      /* De jos in sus: nisipul cu lumina de sus (card lift), apoi capetele indoite,
         mai inchise spre pliu, apoi o linie fina de lumina pe muchia de sus. */
      background:
        linear-gradient(
          90deg,
          rgb(var(--shadow-rgb) / 3%) 0,
          rgb(var(--shadow-rgb) / 10%) var(--tail),
          transparent var(--tail) calc(100% - var(--tail)),
          rgb(var(--shadow-rgb) / 10%) calc(100% - var(--tail)),
          rgb(var(--shadow-rgb) / 3%) 100%
        ),
        linear-gradient(
          180deg,
          color-mix(in srgb, var(--paper-sand) 55%, var(--paper-highlight)) 0%,
          var(--paper-sand) 55%,
          color-mix(in srgb, var(--paper-sand) 92%, var(--ink-line)) 100%
        );
      box-shadow: inset 0 1px 0 color-mix(in srgb, var(--paper-highlight) 50%, transparent);
    }

    .ribbon__text {
      min-width: 0;
      text-wrap: balance;
    }

    .ribbon__heart {
      color: var(--blush-ink);
    }

    @media (forced-colors: active) {
      :host {
        border: 1px solid CanvasText;
      }
    }
  `,
})
export class Ribbon {
  /** `sm`: antete de zi in liste (~28px); `md`: etichete de sectiune (~36px). */
  readonly size = input<RibbonSize>('md');

  /** Inimioare decorative de o parte si de alta, ca "♡ Big Memories ♡". */
  readonly decorated = input(false, { transform: booleanAttribute });
}
