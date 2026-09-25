import { Component, input } from '@angular/core';

/**
 * Cusatura: linia punctata de caramel din interiorul ramelor din imaginea de referinta.
 *
 * Se pune ca ultim copil intr-un container cu `position: relative`. E desenata in SVG
 * (`stroke-dasharray`), nu cu `border-style: dashed`, pentru ca fiecare browser
 * deseneaza altfel liniutele unei borduri; in SVG sunt identice peste tot.
 *
 * E pur decorativa (`aria-hidden`) si nu e niciodata singura margine vizibila a unui
 * control interactiv: controalele au propria margine de >= 3:1.
 */
@Component({
  selector: 'app-stitch',
  host: { 'aria-hidden': 'true' },
  template: `
    <svg focusable="false">
      <rect width="100%" height="100%" [attr.rx]="radius()" [attr.ry]="radius()" />
    </svg>
  `,
  styles: `
    :host {
      position: absolute;
      inset: var(--stitch-inset);
      color: var(--stitch-color);
      pointer-events: none;
    }

    svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      /* Jumatate din grosimea liniei iese in afara SVG-ului; o lasam sa se vada. */
      overflow: visible;
    }

    rect {
      fill: none;
      stroke: currentColor;
      stroke-width: var(--stitch-width);
      stroke-dasharray: var(--stitch-dash);
      stroke-linecap: round;
      vector-effect: non-scaling-stroke;
    }

    @media (forced-colors: active) {
      :host {
        display: none;
      }
    }
  `,
})
export class Stitch {
  /** Raza colturilor, in px. Tine-o cu ~7px mai mica decat raza containerului. */
  readonly radius = input(9);
}
