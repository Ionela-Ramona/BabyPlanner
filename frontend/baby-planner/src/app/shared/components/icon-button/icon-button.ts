import { Component, ElementRef, inject, input } from '@angular/core';

import { Icon } from '../icon/icon';
import { IconName } from '../icon/icon-names';

export type IconButtonVariant = 'plain' | 'soft';

/**
 * Buton doar cu iconita: 48x48 minim, rotund. `label` e obligatoriu (input.required),
 * ca o iconita fara nume accesibil sa fie eroare de compilare, nu o gaura in UI
 * descoperita abia la testarea cu cititorul de ecran.
 *
 * Selectorul se potriveste direct pe elementul nativ (`<button app-icon-button>` sau
 * `<a app-icon-button>`), nu il infasoara: focusul, `disabled` si `routerLink` raman
 * comportamentul nativ al elementului.
 */
@Component({
  selector: 'button[app-icon-button], a[app-icon-button]',
  imports: [Icon],
  host: {
    class: 'icon-btn',
    '[class.icon-btn--plain]': "variant() === 'plain'",
    '[class.icon-btn--soft]': "variant() === 'soft'",
    '[attr.aria-label]': 'label()',
    '[attr.type]': 'nativeType',
  },
  template: `<app-icon [name]="icon()" [size]="20" />`,
  styles: `
    :host {
      position: relative;
      display: inline-flex;
      box-sizing: border-box;
      min-width: var(--tap-min);
      min-height: var(--tap-min);
      align-items: center;
      justify-content: center;
      padding: 0;
      border: 1px solid transparent;
      border-radius: var(--radius-pill);
      background: none;
      color: var(--color-text);
      cursor: pointer;
      text-decoration: none;
      transition:
        background-color var(--dur-fast) var(--ease-out),
        border-color var(--dur-fast) var(--ease-out),
        transform var(--dur-fast) var(--ease-out);
    }

    /* Plin: transparent, se scufunda usor la hover, ca o apasare pe hartie. */
    :host(.icon-btn--plain) {
      @media (hover: hover) {
        &:hover {
          background-color: var(--color-surface-muted);
        }
      }
    }

    /* Moale: suprafata cardului cu margine >= 3:1, pentru butoane care stau singure
       pe fundalul paginii (nu langa alt continut care sa le contureze). */
    :host(.icon-btn--soft) {
      border-color: var(--color-line);
      background-color: var(--color-surface);
      box-shadow: var(--shadow-sm);

      @media (hover: hover) {
        &:hover {
          background-color: var(--color-primary-soft);
        }
      }
    }

    :host(:active:not(:disabled, [aria-disabled='true'])) {
      transform: translateY(1px);
    }

    :host(:disabled),
    :host([aria-disabled='true']) {
      cursor: not-allowed;
      opacity: 0.55;
    }

    @media (forced-colors: active) {
      :host {
        border-color: ButtonText;
      }
    }
  `,
})
export class IconButton {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly icon = input.required<IconName>();

  /** Numele accesibil, in romana. Obligatoriu. */
  readonly label = input.required<string>();

  readonly variant = input<IconButtonVariant>('plain');

  /* Un <button> fara type e "submit" implicit intr-un formular; il fortam la
     "button" doar cand gazda chiar e un <button> (nu si pentru <a>). */
  protected readonly nativeType = this.elementRef.nativeElement.tagName === 'BUTTON' ? 'button' : null;
}
