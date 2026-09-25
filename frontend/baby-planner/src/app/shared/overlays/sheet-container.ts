import { CdkDialogContainer } from '@angular/cdk/dialog';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { Component } from '@angular/core';

import { Edge } from '../components/edge/edge';

/**
 * Containerul foii (bottom sheet / panou centrat), folosit de `SheetService` in
 * locul `CdkDialogContainer` implicit. Extinde clasa CDK ca sa mosteneasca
 * capcana de focus, restaurarea focusului si legaturile ARIA (id/role/label) —
 * exact mecanismul prin care Angular Material isi construieste propriile
 * containere peste `@angular/cdk/dialog`.
 *
 * Doar structura si decorul: manerul de tragere si marginea festonata sunt
 * vizibile pe telefon; de la 48rem in sus devine un panou centrat obisnuit
 * (vezi src/styles/_overlays.scss pentru pozitionarea pe `.cdk-overlay-pane`).
 */
@Component({
  selector: 'app-sheet-container',
  imports: [CdkPortalOutlet, Edge],
  host: {
    class: 'sheet-panel',
  },
  template: `
    <div class="sheet-panel__handle" aria-hidden="true"></div>
    <app-edge position="top" class="sheet-panel__edge" />
    <div class="sheet-panel__scroll">
      <ng-template cdkPortalOutlet />
    </div>
  `,
  styles: `
    :host {
      position: relative;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      max-height: 90dvh;
      padding-bottom: env(safe-area-inset-bottom);
      border-radius: var(--radius-xl) var(--radius-xl) 0 0;
      background-color: var(--color-surface);
      box-shadow: var(--shadow-lg);
      outline: none;
      transition:
        transform var(--dur) var(--ease-out),
        opacity var(--dur) var(--ease-out);
    }

    @starting-style {
      :host {
        transform: translateY(100%);
        opacity: 0;
      }
    }

    .sheet-panel__handle {
      flex: none;
      width: 2.5rem;
      height: 0.25rem;
      margin: var(--space-3) auto 0;
      border-radius: var(--radius-pill);
      background-color: var(--color-border);
    }

    .sheet-panel__edge {
      --edge-color: var(--color-surface);

      flex: none;
    }

    .sheet-panel__scroll {
      flex: 1;
      min-height: 0;
      padding: var(--space-2) var(--space-5) var(--space-5);
      overflow-y: auto;
    }

    @media (min-width: 48rem) {
      :host {
        max-height: 85vh;
        border-radius: var(--radius-xl);
        transform: scale(1);
      }

      @starting-style {
        :host {
          transform: scale(0.96);
          opacity: 0;
        }
      }

      .sheet-panel__handle,
      .sheet-panel__edge {
        display: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      :host {
        transition: opacity var(--dur-fast) var(--ease-out);
        transform: none !important;
      }

      @starting-style {
        :host {
          opacity: 0;
        }
      }
    }
  `,
})
export class SheetContainer extends CdkDialogContainer {}
