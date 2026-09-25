import { Component, computed, input } from '@angular/core';

import { hostSize } from '../frame/host-size';
import { CLOUD_MARGIN, cloudLayout, cloudPath, stitchDash } from '../frame/shape-geometry';

export type BubbleAlign = 'start' | 'center';

/** Distanta dintre marginea norului si cusatura, in px. */
const STITCH_INSET = 8;

/** Marimea folosita pana la prima masurare (si in teste, unde nu exista ResizeObserver). */
const FALLBACK = { width: 320, height: 150 } as const;

/**
 * Norul "You are our Greatest Adventure" din imaginea de referinta: o bula de
 * hartie palida cu lobi moi, umbra calda si o cusatura punctata in interior.
 * Pentru stari goale si confirmari ("afirmatii").
 *
 * Conturul e calculat in pixeli pe marimea reala: cand textul lateste norul, se
 * adauga lobi (nu se intind cei existenti), iar cusatura urmeaza exact aceiasi lobi.
 * Continutul e text real, proiectat. `scriptLine` adauga dedesubt un rand in
 * scris de mana (doar pentru salutari si numele bebelusului).
 */
@Component({
  selector: 'app-bubble',
  host: {
    class: 'bubble',
    '[class.bubble--start]': "align() === 'start'",
    '[class.bubble--center]': "align() === 'center'",
    '[style.--bubble-edge.px]': 'edge',
  },
  template: `
    <svg class="bubble__fill" aria-hidden="true" focusable="false" [attr.viewBox]="viewBox()">
      <path [attr.d]="outline().d" />
    </svg>
    <svg class="bubble__stitch" aria-hidden="true" focusable="false" [attr.viewBox]="viewBox()">
      <path [attr.d]="stitch().d" [attr.stroke-dasharray]="dash()" />
    </svg>
    <div class="bubble__body">
      <ng-content />
      @if (scriptLine()) {
        <p class="bubble__script script script--medium">{{ scriptLine() }}</p>
      }
    </div>
  `,
  styles: `
    :host {
      position: relative;
      z-index: 0;
      display: block;
      width: fit-content;
      min-width: 12rem;
      max-width: 100%;
      /* --bubble-edge = lobii + cusatura; peste ele, aer, ca textul sa nu atinga cusatura. */
      padding: calc(var(--bubble-edge) + var(--space-4)) calc(var(--bubble-edge) + var(--space-6));
      color: var(--color-text-strong);
      font-family: var(--font-display);
      font-size: var(--text-lead);
      line-height: 1.4;
    }

    svg {
      position: absolute;
      inset: 0;
      z-index: -1;
      width: 100%;
      height: 100%;
      overflow: visible;
      pointer-events: none;
    }

    .bubble__fill {
      fill: var(--paper-highlight);
      filter: drop-shadow(0 4px 10px rgb(var(--shadow-rgb) / 16%));
    }

    .bubble__stitch {
      fill: none;
      stroke: var(--stitch-color);
      stroke-width: var(--stitch-width);
      stroke-linecap: round;
    }

    .bubble__body {
      text-wrap: balance;
    }

    :host(.bubble--center) .bubble__body {
      text-align: center;
    }

    .bubble__body > ::ng-deep :first-child {
      margin-top: 0;
    }

    .bubble__body > ::ng-deep :last-child {
      margin-bottom: 0;
    }

    .bubble__script {
      margin: var(--space-1) 0 0;
      /* Caramelul din referinta are doar 2.9:1; cerneala de miere pastreaza tonul si trece de 4.5:1. */
      color: var(--honey-ink);
      text-wrap: balance;
    }

    @media (forced-colors: active) {
      :host {
        border: 1px solid CanvasText;
      }

      svg {
        display: none;
      }
    }
  `,
})
export class Bubble {
  /** Randul in scris de mana de sub continut; fara el, nu se deseneaza nimic. */
  readonly scriptLine = input<string>();

  readonly align = input<BubbleAlign>('center');

  protected readonly edge = CLOUD_MARGIN + STITCH_INSET;

  private readonly measured = hostSize();

  private readonly box = computed(() => {
    const size = this.measured();
    return size && size.width > 0 && size.height > 0 ? size : FALLBACK;
  });

  protected readonly viewBox = computed(() => `0 0 ${this.box().width} ${this.box().height}`);

  private readonly layout = computed(() => cloudLayout(this.box().width, this.box().height));

  protected readonly outline = computed(() => {
    const { width, height } = this.box();
    return cloudPath(0, 0, width, height, this.layout());
  });

  protected readonly stitch = computed(() => {
    const { width, height } = this.box();
    const inset = STITCH_INSET;
    return cloudPath(inset, inset, width - 2 * inset, height - 2 * inset, this.layout());
  });

  protected readonly dash = computed(() => stitchDash(this.stitch().length));
}
