import { Component, input } from '@angular/core';

/**
 * Marginea festonata (dantela de jos din imaginea de referinta).
 *
 * Se pune ca prim copil intr-un container cu `position: relative` si are culoarea
 * containerului (`--edge-color`, implicit culoarea suprafetei), asa ca pare ca
 * suprafata insasi se termina in feston. Forma vine dintr-un `mask` cu gradiente
 * radiale repetate, nu dintr-un `clip-path` cu zeci de puncte.
 */
@Component({
  selector: 'app-edge',
  host: {
    'aria-hidden': 'true',
    '[class.edge--top]': "position() === 'top'",
    '[class.edge--bottom]': "position() === 'bottom'",
  },
  template: '',
  styles: `
    :host {
      --edge-size: 0.875rem;

      position: absolute;
      left: 0;
      right: 0;
      height: calc(var(--edge-size) / 2 + 1px);
      background-color: var(--edge-color, var(--color-surface));
      pointer-events: none;
    }

    :host(.edge--top) {
      bottom: calc(100% - 1px);
      mask: radial-gradient(
          circle at 50% 100%,
          #000 calc(var(--edge-size) / 2 - 0.5px),
          transparent calc(var(--edge-size) / 2)
        )
        repeat-x 50% 0 / var(--edge-size) calc(var(--edge-size) / 2 + 1px);
    }

    :host(.edge--bottom) {
      top: calc(100% - 1px);
      mask: radial-gradient(
          circle at 50% 0%,
          #000 calc(var(--edge-size) / 2 - 0.5px),
          transparent calc(var(--edge-size) / 2)
        )
        repeat-x 50% 0 / var(--edge-size) calc(var(--edge-size) / 2 + 1px);
    }

    @media (forced-colors: active) {
      :host {
        display: none;
      }
    }
  `,
})
export class Edge {
  readonly position = input<'top' | 'bottom'>('top');
}
