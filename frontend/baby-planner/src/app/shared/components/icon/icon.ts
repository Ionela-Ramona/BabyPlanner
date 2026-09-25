import { Component, computed, input } from '@angular/core';

import { IconName } from './icon-names';

/**
 * O iconita din sprite-ul aplicatiei.
 *
 * Doua moduri, alese dupa `label`:
 * - fara `label`: decorativa, `aria-hidden` (textul de langa ea spune deja ce e);
 * - cu `label`: `role="img"` + `aria-label`, pentru iconitele care stau singure.
 *
 * Culoarea vine din `currentColor`, deci iconita ia culoarea textului parinte.
 */
@Component({
  selector: 'app-icon',
  host: {
    class: 'icon',
    '[attr.role]': "label() ? 'img' : null",
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': "label() ? null : 'true'",
    '[style.--icon-size]': 'sizeCss()',
  },
  template: `<svg focusable="false"><use [attr.href]="href()" /></svg>`,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
      width: var(--icon-size, 1.5rem);
      height: var(--icon-size, 1.5rem);
      color: inherit;
    }

    svg {
      width: 100%;
      height: 100%;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.75;
      stroke-linecap: round;
      stroke-linejoin: round;
      overflow: visible;
    }
  `,
})
export class Icon {
  readonly name = input.required<IconName>();

  /** Numele accesibil, in romana. Gol = iconita decorativa. */
  readonly label = input<string>();

  /** Marimea in px (numar) sau orice lungime CSS. Implicit 24px. */
  readonly size = input<number | string>();

  protected readonly href = computed(() => `icons/sprite.svg#${this.name()}`);

  protected readonly sizeCss = computed(() => {
    const size = this.size();
    if (size === undefined) {
      return null;
    }
    return typeof size === 'number' ? `${size}px` : size;
  });
}
