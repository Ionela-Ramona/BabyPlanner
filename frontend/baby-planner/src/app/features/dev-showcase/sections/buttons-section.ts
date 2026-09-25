import { Component } from '@angular/core';

import { AddButton } from '../../../shared/components/add-button/add-button';
import { Button, ButtonSize, ButtonVariant } from '../../../shared/components/button/button';
import { IconButton } from '../../../shared/components/icon-button/icon-button';

/** Sectiunea "Butoane" din vitrina: appButton, butoane cu iconiță, butonul ＋ Adaugă. */
@Component({
  selector: 'app-buttons-section',
  imports: [Button, IconButton, AddButton],
  template: `
    <section class="showcase-section">
      <h3>Butoane</h3>

      <div class="showcase-group">
        <h4>appButton — variante × mărimi, implicit / dezactivat / în încărcare</h4>
        <div class="variant-table">
          @for (variant of variants; track variant) {
            <span class="variant-table__label">{{ variant }}</span>
            <div class="variant-table__cell">
              @for (size of sizes; track size) {
                <button appButton [variant]="variant" [size]="size">Salvează ({{ size }})</button>
                <button appButton [variant]="variant" [size]="size" disabled>Dezactivat</button>
                <button appButton [variant]="variant" [size]="size" loading>Se salvează</button>
              }
            </div>
          }
        </div>
      </div>

      <div class="showcase-group">
        <h4>appButton — pe &lt;a&gt;, pentru navigare</h4>
        <div class="anchor-row">
          @for (variant of variants; track variant) {
            <a appButton [variant]="variant" href="#surfaces-section">{{ variant }}</a>
          }
          <a appButton variant="secondary" aria-disabled="true" tabindex="-1">dezactivat</a>
        </div>
        <p class="text-small text-muted">
          Fantoma ("ghost") e pentru navigare terțiară, ca linkul „Toți bebelușii".
        </p>
      </div>

      <div class="showcase-group">
        <h4>Butoane doar cu iconiță</h4>
        <div class="icon-btn-row">
          <button app-icon-button icon="edit" label="Editează" variant="plain"></button>
          <button app-icon-button icon="delete" label="Șterge" variant="plain"></button>
          <button app-icon-button icon="close" label="Închide" variant="soft"></button>
          <button app-icon-button icon="close" label="Închide" variant="soft" disabled></button>
        </div>
      </div>

      <div class="showcase-group">
        <h4>Butonul central ＋ Adaugă</h4>
        <div class="add-btn-row">
          <button app-add-button></button>
          <button app-add-button [showLabel]="false"></button>
          <button app-add-button disabled></button>
        </div>
      </div>
    </section>
  `,
  styles: `
    .showcase-group {
      display: grid;
      gap: var(--space-3);
      margin-bottom: var(--space-6);
    }

    h4 {
      margin: 0;
      font-family: var(--font-display);
      font-size: var(--text-lead);
      font-weight: 500;
    }

    .variant-table {
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: start;
      gap: var(--space-3) var(--space-4);
    }

    .variant-table__label {
      padding-top: var(--space-2);
      color: var(--color-text-muted);
      font-size: var(--text-small);
      font-weight: 700;
      text-transform: capitalize;
    }

    .variant-table__cell {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .anchor-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-3);
    }

    .icon-btn-row,
    .add-btn-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-4);
    }
  `,
})
export class ButtonsSection {
  protected readonly variants: readonly ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger'];
  protected readonly sizes: readonly ButtonSize[] = ['md', 'lg'];
}
