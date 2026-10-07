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
 * Comutatorul de tema din foaia "Aspect": Sistem / Luminos / Noapte.
 *
 * Grup de butoane radio native, nu butoane cu `aria-pressed`: sagetile schimba
 * alegerea, iar cititorul de ecran spune "Temă, grup, Noapte, buton radio, 3 din 3"
 * fara nicio linie de ARIA scrisa de mana. In foaie e loc de text: iconita + eticheta.
 */
@Component({
  selector: 'app-theme-toggle',
  imports: [Icon],
  template: `
    <fieldset class="theme-toggle">
      <legend class="theme-toggle__legend">Temă</legend>
      <div class="theme-toggle__track">
        @for (option of options; track option.value) {
          <label class="theme-toggle__option">
            <input
              class="theme-toggle__input"
              type="radio"
              name="bp-theme"
              [value]="option.value"
              [checked]="theme.preference() === option.value"
              (change)="theme.set(option.value)"
            />
            <app-icon [name]="option.icon" [size]="20" />
            {{ option.label }}
          </label>
        }
      </div>
    </fieldset>
  `,
  styles: `
    :host {
      display: block;
    }

    .theme-toggle {
      margin: 0;
      padding: 0;
      border: 0;
    }

    .theme-toggle__track {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 2px;
      padding: 3px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      background-color: var(--paper-sunk);
    }

    /* Legenda sta deasupra, ca titlul sectiunii de fundal de sub ea. */
    .theme-toggle__legend {
      margin-bottom: var(--space-3);
      padding: 0;
      color: var(--color-text-strong);
      font-weight: 800;
    }

    .theme-toggle__option {
      position: relative;
      /* Iconita deasupra etichetei: "Ca sistemul" incape intreg si la 360px. */
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      /* 48px: tinta minima a aplicatiei, pentru degetul mare, noaptea, cu o mana. */
      min-height: var(--tap-min);
      padding: var(--space-2);
      border-radius: var(--radius-md);
      font-size: var(--text-small);
      font-weight: 700;
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
