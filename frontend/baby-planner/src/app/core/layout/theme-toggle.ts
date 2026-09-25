import { Component, inject } from '@angular/core';

import { Icon } from '../../shared/components/icon/icon';
import { IconName } from '../../shared/components/icon/icon-names';
import { ThemePreference, ThemeService } from '../services/theme';

interface ThemeOption {
  readonly value: ThemePreference;
  readonly label: string;
  readonly icon: IconName;
}

/**
 * Comutatorul de tema din bara de sus: Sistem / Luminos / Noapte.
 *
 * Grup de butoane radio native, nu butoane cu `aria-pressed`: sagetile schimba
 * alegerea, iar cititorul de ecran spune "Temă, grup, Noapte, buton radio, 3 din 3"
 * fara nicio linie de ARIA scrisa de mana. Vizual sunt trei iconite; textul ramane
 * pentru cititorul de ecran si ca tooltip.
 */
@Component({
  selector: 'app-theme-toggle',
  imports: [Icon],
  template: `
    <fieldset class="theme-toggle">
      <legend class="visually-hidden">Temă</legend>
      @for (option of options; track option.value) {
        <label class="theme-toggle__option" [title]="option.label">
          <input
            class="theme-toggle__input"
            type="radio"
            name="bp-theme"
            [value]="option.value"
            [checked]="theme.preference() === option.value"
            (change)="theme.set(option.value)"
          />
          <app-icon [name]="option.icon" [size]="20" />
          <span class="visually-hidden">{{ option.label }}</span>
        </label>
      }
    </fieldset>
  `,
  styles: `
    :host {
      display: inline-flex;
    }

    .theme-toggle {
      display: inline-flex;
      gap: 2px;
      margin: 0;
      padding: 3px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-pill);
      background-color: var(--paper-sunk);
    }

    .theme-toggle__option {
      position: relative;
      display: inline-grid;
      place-items: center;
      /* 44px vizibil + 2px spatiu intre ele: tinta ramane >= 44px (WCAG 2.5.8
         cere 24px; ne tinem de 44px pentru degetul mare, noaptea, cu o mana). */
      width: 2.75rem;
      height: 2.75rem;
      border-radius: var(--radius-pill);
      color: var(--color-text-muted);
      cursor: pointer;
      transition:
        background-color var(--dur-fast) var(--ease-out),
        color var(--dur-fast) var(--ease-out);
    }

    /* Inputul acopera toata eticheta (tinta de atingere), dar e invizibil. */
    .theme-toggle__input {
      position: absolute;
      inset: 0;
      margin: 0;
      opacity: 0;
      cursor: pointer;
    }

    .theme-toggle__option:has(:checked) {
      background-color: var(--paper-card);
      box-shadow: var(--shadow-sm);
      color: var(--honey-ink);
    }

    .theme-toggle__option:has(:focus-visible) {
      outline: 2px solid var(--color-focus);
      outline-offset: 1px;
    }

    @media (hover: hover) {
      .theme-toggle__option:hover:not(:has(:checked)) {
        color: var(--color-text);
      }
    }

    @media (forced-colors: active) {
      .theme-toggle__option:has(:checked) {
        outline: 2px solid Highlight;
      }
    }
  `,
})
export class ThemeToggle {
  protected readonly theme = inject(ThemeService);

  protected readonly options: readonly ThemeOption[] = [
    { value: 'system', label: 'Ca sistemul', icon: 'monitor' },
    { value: 'light', label: 'Luminos', icon: 'sun' },
    { value: 'dark', label: 'Noapte', icon: 'moon' },
  ];
}
