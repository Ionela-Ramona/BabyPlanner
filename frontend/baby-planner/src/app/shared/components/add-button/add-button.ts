import { Component, booleanAttribute, input } from '@angular/core';

import { Icon } from '../icon/icon';

/**
 * Actiunea centrala din bara de jos: "＋ Adaugă". Nu e un FAB oarecare, ci un cub
 * de lemn ridicat — muchia de sus prinde lumina, muchia de jos e mai inchisa (latura
 * cubului), iar apasarea il "aseaza" la loc (se scufunda 2px, umbra se strange).
 *
 * Componenta se potriveste pe elementul nativ (`<button app-add-button>`), nu il
 * infasoara, ca `disabled` si focusul sa ramana comportamentul standard al butonului.
 */
@Component({
  selector: 'button[app-add-button]',
  imports: [Icon],
  host: {
    class: 'add-btn',
    '[attr.aria-label]': 'label()',
    '[attr.type]': "'button'",
  },
  template: `
    <app-icon name="plus" [size]="28" />
    @if (showLabel()) {
      <span class="add-btn__label">{{ label() }}</span>
    }
  `,
  styles: `
    @use 'styles/mixins' as m;

    :host {
      @include m.honey-button;

      position: relative;
      display: inline-flex;
      box-sizing: border-box;
      width: 4rem;
      height: 4rem;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      border-radius: var(--radius-lg);
      color: var(--on-accent);
      font-family: var(--font-sans);
      cursor: pointer;
      /* Peste gradientul de miere: muchia de sus lumineaza (mostenita din
         m.honey-button), muchia de jos e o banda mai inchisa (latura cubului),
         iar umbra de sub tot cubul il ridica de pe pagina. */
      box-shadow:
        inset 0 1px 0 var(--honey-button-highlight),
        inset 0 -3px 0 color-mix(in srgb, var(--honey-line) 55%, var(--honey-button-bottom)),
        0 10px 18px -8px rgb(var(--shadow-rgb) / 38%);
      transition:
        transform var(--dur-fast) var(--ease-out),
        box-shadow var(--dur-fast) var(--ease-out),
        filter var(--dur-fast) var(--ease-out);
    }

    @media (hover: hover) {
      :host(:hover:not(:disabled, [aria-disabled='true'])) {
        filter: brightness(1.04) saturate(1.06);
      }
    }

    /* Apasarea "aseaza" cubul: coboara 2px si isi pierde din inaltime umbra +
       muchia de jos, ca un obiect real care se sprijina pe hartie. */
    :host(:active:not(:disabled, [aria-disabled='true'])) {
      transform: translateY(2px);
      box-shadow:
        inset 0 1px 0 var(--honey-button-highlight),
        inset 0 -1px 0 color-mix(in srgb, var(--honey-line) 55%, var(--honey-button-bottom)),
        0 4px 8px -4px rgb(var(--shadow-rgb) / 32%);
    }

    :host(:disabled),
    :host([aria-disabled='true']) {
      cursor: not-allowed;
      opacity: 0.55;
    }

    .add-btn__label {
      font-size: var(--text-caption);
      font-weight: 700;
      line-height: 1;
      letter-spacing: -0.01em;
    }

    @media (forced-colors: active) {
      :host {
        border-color: ButtonText;
      }
    }
  `,
})
export class AddButton {
  readonly label = input('Adaugă');
  readonly showLabel = input(true, { transform: booleanAttribute });
}
