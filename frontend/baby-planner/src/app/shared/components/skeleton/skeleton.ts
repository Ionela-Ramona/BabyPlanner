import { Component, computed, input } from '@angular/core';

export type SkeletonVariant = 'row' | 'tile' | 'baby-card' | 'profile' | 'text';

const TEXT_LINE_WIDTHS = [92, 78, 60];

/**
 * Placeholder de incarcare: blocuri "scufundate in hartie" cu o sclipire lenta,
 * fiecare preset oglindind forma continutului real (rand de cronologie, bloc
 * de activitate, card de bebelus, profil, paragraf). `role="status"` + textul
 * ascuns vizual inlocuiesc "Se încarcă…" simplu, fara sa schimbe semantica
 * pentru cititorul de ecran.
 *
 * Nota: `:host` e `display: flex` (nu `grid`), ca fiecare forma sa se intinda
 * pe toata latimea containerului chiar si cand componenta sta intr-un rand
 * flex fara latime explicita (grid cu o singura coloana `auto` s-ar prabusi
 * la latimea continutului, adica zero, pentru un `div` gol).
 */
@Component({
  selector: 'app-skeleton',
  host: {
    role: 'status',
    class: 'skeleton',
    '[attr.data-variant]': 'variant()',
  },
  template: `
    <span class="visually-hidden">Se încarcă…</span>
    @for (item of items(); track $index) {
      @switch (variant()) {
        @case ('row') {
          <div class="skeleton__row" aria-hidden="true">
            <div class="skeleton__shape skeleton__shape--dot"></div>
            <div class="skeleton__shape skeleton__shape--time"></div>
            <div class="skeleton__shape skeleton__shape--text"></div>
            <div class="skeleton__shape skeleton__shape--chevron"></div>
          </div>
        }
        @case ('baby-card') {
          <div class="skeleton__profile" aria-hidden="true">
            <div class="skeleton__shape skeleton__shape--circle"></div>
            <div class="skeleton__lines">
              <div class="skeleton__shape skeleton__shape--line-lg"></div>
              <div class="skeleton__shape skeleton__shape--line-sm"></div>
            </div>
          </div>
        }
        @case ('profile') {
          <div class="skeleton__profile" aria-hidden="true">
            <div class="skeleton__shape skeleton__shape--circle skeleton__shape--circle-lg"></div>
            <div class="skeleton__lines">
              <div class="skeleton__shape skeleton__shape--line-lg"></div>
              <div class="skeleton__shape skeleton__shape--line-sm"></div>
            </div>
          </div>
        }
        @case ('text') {
          <div class="skeleton__shape skeleton__shape--text-line" [style.width.%]="textLineWidth($index)" aria-hidden="true"></div>
        }
        @default {
          <div class="skeleton__shape skeleton__shape--tile" aria-hidden="true"></div>
        }
      }
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-width: 0;
      width: 100%;
      gap: var(--space-3);
    }

    :host([data-variant='tile']) {
      flex-direction: row;
      flex-wrap: wrap;
    }

    .skeleton__shape {
      position: relative;
      flex: none;
      overflow: hidden;
      background-color: var(--color-surface-muted);
      border-radius: var(--radius-sm);
    }

    .skeleton__shape::after {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        transparent,
        color-mix(in srgb, var(--paper-highlight) 70%, transparent),
        transparent
      );
      content: '';
      animation: skeleton-sheen 1.6s ease-in-out infinite;
      transform: translateX(-100%);
    }

    @keyframes skeleton-sheen {
      100% {
        transform: translateX(100%);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .skeleton__shape::after {
        display: none;
      }
    }

    /* Rand de cronologie: bulina tipului, ora tabulara, textul, sageata. */
    .skeleton__row {
      display: flex;
      align-items: center;
      width: 100%;
      height: 3.5rem;
      gap: var(--space-3);
    }

    .skeleton__shape--dot {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: var(--radius-md);
    }

    .skeleton__shape--time {
      width: 3rem;
      height: 0.875rem;
    }

    .skeleton__shape--text {
      flex: 1 1 auto;
      min-width: 0;
      height: 1rem;
    }

    .skeleton__shape--chevron {
      width: 1rem;
      height: 1rem;
    }

    /* Bloc de activitate (tile): un singur cub, cat un card. */
    .skeleton__shape--tile {
      width: 100%;
      height: 5.5rem;
      border-radius: var(--radius-md);
    }

    :host([data-variant='tile']) .skeleton__shape--tile {
      flex: 1 1 5rem;
      width: auto;
    }

    /* Card de bebelus / profil: avatar rotund + doua linii de text. */
    .skeleton__profile {
      display: flex;
      align-items: center;
      width: 100%;
      gap: var(--space-3);
    }

    .skeleton__lines {
      display: flex;
      flex: 1 1 auto;
      flex-direction: column;
      min-width: 0;
      gap: var(--space-2);
    }

    .skeleton__shape--circle {
      width: 3rem;
      height: 3rem;
      border-radius: var(--radius-pill);
    }

    .skeleton__shape--circle-lg {
      width: 4rem;
      height: 4rem;
    }

    .skeleton__shape--line-lg {
      width: 60%;
      height: 1rem;
    }

    .skeleton__shape--line-sm {
      width: 40%;
      height: 0.75rem;
    }

    /* Paragraf: linii de latimi diferite, ca un text real. */
    .skeleton__shape--text-line {
      height: 0.875rem;
    }
  `,
})
export class Skeleton {
  readonly variant = input<SkeletonVariant>('row');
  readonly count = input(1);

  protected readonly items = computed(() => Array.from({ length: Math.max(1, this.count()) }));

  protected textLineWidth(index: number): number {
    return TEXT_LINE_WIDTHS[index % TEXT_LINE_WIDTHS.length];
  }
}
