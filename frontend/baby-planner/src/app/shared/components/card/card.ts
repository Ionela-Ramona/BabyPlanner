import { Component, input } from '@angular/core';

import { Stitch } from '../stitch/stitch';

export type CardVariant = 'plain' | 'stitched' | 'tinted';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * Suprafata de baza a aplicatiei: hartie ridicata (`plain`), cu cusatura
 * (`stitched`) sau tonata in culoarea unui tip de activitate (`tinted`).
 *
 * Nu decide semantica: gazda e un bloc simplu, iar apelantul o pune in <li>,
 * <article> sau <section> dupa caz (listele existente folosesc <li class="card">,
 * pastram acea semantica in paginile care migreaza pe app-card).
 */
@Component({
  selector: 'app-card',
  imports: [Stitch],
  host: {
    // Nu "card": clasa globala veche .card (styles/_legacy.scss) ar adauga padding dublu.
    class: 'bp-card',
    '[class.card--plain]': "variant() === 'plain'",
    '[class.card--stitched]': "variant() === 'stitched'",
    '[class.card--tinted]': "variant() === 'tinted'",
    '[attr.data-tone]': 'tone() || null',
    // Cusatura urmareste tonul (linia cubului) doar cand un ton e dat; altfel caramel.
    '[style.--stitch-color]': "tone() ? 'var(--block-line)' : null",
  },
  template: `
    <div class="card__content" [class]="'card__pad-' + padding()">
      <ng-content />
    </div>
    @if (variant() === 'stitched') {
      <app-stitch [radius]="9" />
    }
  `,
  styles: `
    @use 'styles/mixins' as m;

    :host {
      position: relative;
      display: block;
      border-radius: var(--radius-lg);
    }

    :host(.card--plain),
    :host(.card--stitched) {
      @include m.card-lift;

      box-shadow: var(--shadow-md);
    }

    /* Hartia tonata: acelasi gradient blind ca --block-soft, cu fallback pe piatra
       cand nu s-a dat niciun ton (nu exista atributul data-tone). */
    :host(.card--tinted) {
      background: linear-gradient(
        180deg,
        color-mix(in srgb, var(--block-soft, var(--stone-soft)) 55%, var(--paper-highlight)) 0%,
        var(--block-soft, var(--stone-soft)) 100%
      );
      box-shadow: var(--shadow-sm);
    }

    /* Continutul proiectat sta deasupra cusaturii (care e pointer-events: none),
       fara sa depindem de ordinea din DOM. */
    .card__content {
      position: relative;
      z-index: 1;
    }

    .card__pad-none {
      padding: 0;
    }

    .card__pad-sm {
      padding: var(--space-4);
    }

    .card__pad-md {
      padding: var(--space-6);
    }

    .card__pad-lg {
      padding: var(--space-8);
    }

    @media (forced-colors: active) {
      :host {
        border: 1px solid CanvasText;
      }
    }
  `,
})
export class Card {
  readonly variant = input<CardVariant>('plain');

  /** Un ton din lista `[data-tone]` (styles/_surfaces.scss); optional. */
  readonly tone = input<string>();

  readonly padding = input<CardPadding>('md');
}
