import { Component } from '@angular/core';

/**
 * Slotul de subsol al foii: proiecteaza butoanele de actiune, lipite jos in
 * timpul scrollului (`position: sticky`), ca actiunea principala sa ramana
 * la indemana chiar daca lista de deasupra e lunga.
 */
@Component({
  selector: 'app-sheet-footer',
  host: { class: 'sheet-footer' },
  template: `<ng-content />`,
  styles: `
    :host {
      position: sticky;
      bottom: calc(var(--space-5) * -1);
      display: flex;
      gap: var(--space-3);
      justify-content: flex-end;
      margin: var(--space-4) calc(var(--space-5) * -1) calc(var(--space-5) * -1);
      padding: var(--space-4) var(--space-5) calc(var(--space-5) + env(safe-area-inset-bottom));
      border-top: 1px solid var(--color-border);
      background-color: var(--color-surface);
    }

    @media (max-width: 47.9375rem) {
      :host {
        flex-direction: column-reverse;
      }
    }
  `,
})
export class SheetFooter {}
