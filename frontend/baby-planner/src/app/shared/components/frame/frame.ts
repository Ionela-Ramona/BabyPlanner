import { Component, computed, input } from '@angular/core';

import { hostSize } from './host-size';
import { ShapePath, circlePath, roundedPath, scallopPath, stitchDash } from './shape-geometry';

export type FrameShape = 'cloud' | 'circle' | 'rounded';

/** Sub aceasta marime (px) cusatura nu mai incape: ramane doar marginea, mai subtire. */
export const FRAME_STITCH_MIN = 72;

/** Raza patratului rotunjit, ca fractie din latura. */
const ROUNDED_RATIO = 0.22;

/** Marimea implicita, in px. */
const DEFAULT_SIZE = 160;

// Masca norului: acelasi contur ca marginea, in 0-100. Conteaza doar opacitatea,
// deci path-ul ramane cu umplerea implicita si nu are nevoie de nicio culoare.
const CLOUD_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'><path d='${scallopPath(100).d}'/></svg>`,
)}")`;

/** Marimea din input, in px, pana cand stim marimea reala. */
function toPixels(size: number | string): number {
  if (typeof size === 'number') {
    return size;
  }
  const match = /^(\d*\.?\d+)(px|rem)$/.exec(size.trim());
  if (!match) {
    return DEFAULT_SIZE;
  }
  return match[2] === 'rem' ? Number(match[1]) * 16 : Number(match[1]);
}

function outline(shape: FrameShape, box: number, offset = 0): ShapePath {
  switch (shape) {
    case 'circle':
      return circlePath(box, offset);
    case 'rounded':
      return roundedPath(box, (box + 2 * offset) * ROUNDED_RATIO - offset, offset);
    default:
      return scallopPath(box, offset);
  }
}

/**
 * Rama "baby-book" din imaginea de referinta: o banda de hartie palida (rim) cu o
 * umbra calda, continutul decupat in aceeasi forma si o cusatura punctata intre ele.
 *
 * Toate cele trei straturi vin din acelasi contur (shape-geometry.ts), deci se
 * potrivesc perfect la orice marime. Continutul proiectat este fie un `<img>`
 * (apelantul foloseste NgOptimizedImage, aici primeste `object-fit: cover`), fie
 * initiale, scrise mare pe o spalatura in culoarea tonului.
 *
 * Rama nu decide semantica: textul alternativ il da apelantul pe `<img>`.
 */
@Component({
  selector: 'app-frame',
  host: {
    class: 'frame',
    '[class.frame--cloud]': "shape() === 'cloud'",
    '[class.frame--circle]': "shape() === 'circle'",
    '[class.frame--rounded]': "shape() === 'rounded'",
    '[class.frame--stitched]': 'stitched()',
    '[attr.data-tone]': 'tone() ?? null',
    '[style.--frame-size]': 'sizeCss()',
    '[style.--frame-px.px]': 'px()',
    '[style.--frame-rim.px]': 'rim()',
    '[style.--frame-radius]': 'contentRadius()',
  },
  template: `
    <svg class="frame__rim" aria-hidden="true" focusable="false" [attr.viewBox]="viewBox()">
      <path [attr.d]="rimPath()" />
    </svg>
    <div class="frame__content" [style.mask-image]="mask()"><ng-content /></div>
    @if (stitched()) {
      <svg class="frame__stitch" aria-hidden="true" focusable="false" [attr.viewBox]="viewBox()">
        <path [attr.d]="stitch().d" [attr.stroke-dasharray]="dash()" />
      </svg>
    }
  `,
  styles: `
    :host {
      position: relative;
      display: inline-block;
      flex: none;
      width: var(--frame-size);
      height: var(--frame-size);
      vertical-align: middle;
    }

    svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      overflow: visible;
      pointer-events: none;
    }

    /* Umbra urmeaza festoanele (drop-shadow), nu cutia; creste cu rama, dar ramane moale. */
    .frame__rim {
      fill: var(--paper-highlight);
      filter: drop-shadow(
        0 min(calc(var(--frame-px) * 0.03), 6px) min(calc(var(--frame-px) * 0.07), 14px)
          rgb(var(--shadow-rgb) / 24%)
      );
    }

    .frame__stitch {
      fill: none;
      stroke: var(--stitch-color);
      stroke-width: var(--stitch-width);
      stroke-linecap: round;
    }

    .frame__content {
      position: absolute;
      inset: var(--frame-rim);
      display: grid;
      place-items: center;
      overflow: hidden;
      border-radius: var(--frame-radius);
      /* Spalatura de acuarela: tonul, cu o pata de lumina sus-stanga. */
      background:
        radial-gradient(
          circle at 32% 26%,
          color-mix(in srgb, var(--paper-highlight) 60%, transparent),
          transparent 62%
        ),
        var(--block-soft, var(--paper-sunk));
      color: var(--block-ink, var(--color-text-strong));
      font: 600 calc(var(--frame-px) * 0.42) / 1 var(--font-display);
      mask-size: 100% 100%;
      mask-repeat: no-repeat;
      user-select: none;
    }

    .frame__content ::ng-deep img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    @media (forced-colors: active) {
      .frame__content {
        outline: 1px solid CanvasText;
      }

      .frame__stitch {
        display: none;
      }
    }
  `,
})
export class Frame {
  readonly shape = input<FrameShape>('cloud');

  /** Latura ramei: numar (px) sau orice lungime CSS. Intre 40px (avatar) si 320px (profil). */
  readonly size = input<number | string>(DEFAULT_SIZE);

  /** Tonul spalaturii din spatele initialelor (`[data-tone]`: feeding, sleep, blush...). */
  readonly tone = input<string>();

  private readonly measured = hostSize();

  protected readonly sizeCss = computed(() => {
    const size = this.size();
    return typeof size === 'number' ? `${size}px` : size;
  });

  /** Latura reala in px: masurata cand se poate, altfel dedusa din input. */
  protected readonly px = computed(() => this.measured()?.width || toPixels(this.size()));

  protected readonly stitched = computed(() => this.px() >= FRAME_STITCH_MIN);

  /** Marginea palida: ~6.5% din latura, mai subtire la avatare mici. */
  protected readonly rim = computed(() => {
    const px = this.px();
    return this.stitched() ? Math.min(16, px * 0.065) : Math.max(2, px * 0.05);
  });

  protected readonly viewBox = computed(() => `0 0 ${this.px()} ${this.px()}`);

  protected readonly rimPath = computed(() => outline(this.shape(), this.px()).d);

  /** Cusatura sta pe banda palida, mai aproape de poza, ca in referinta. */
  protected readonly stitch = computed(() => {
    const inset = this.rim() * 0.6;
    return outline(this.shape(), this.px() - 2 * inset, inset);
  });

  protected readonly dash = computed(() => stitchDash(this.stitch().length));

  protected readonly mask = computed(() => (this.shape() === 'cloud' ? CLOUD_MASK : null));

  protected readonly contentRadius = computed(() => {
    switch (this.shape()) {
      case 'circle':
        return '50%';
      case 'rounded':
        return `${Math.max(0, this.px() * ROUNDED_RATIO - this.rim())}px`;
      default:
        return '0';
    }
  });
}
