import { Component, input, output } from '@angular/core';

import { Button } from '../button/button';
import { Icon } from '../icon/icon';

/**
 * Inlocuieste cardurile de eroare actuale (`role="alert"` + text). Iconita si
 * nuanta de pericol sunt discrete — un ton, nu un fundal alarmant — pentru ca
 * o eroare la 3 dimineata nu trebuie sa sperie.
 */
@Component({
  selector: 'app-error-state',
  imports: [Button, Icon],
  host: { role: 'alert', class: 'error-state' },
  template: `
    <div class="error-state__icon" data-tone="danger" aria-hidden="true">
      <app-icon name="alert" />
    </div>
    <h2 class="error-state__title">{{ title() }}</h2>
    <p class="error-state__message text-muted">{{ message() }}</p>
    <button appButton variant="secondary" type="button" (click)="retry.emit()">
      <app-icon name="refresh" />
      Reîncearcă
    </button>
  `,
  styles: `
    :host {
      display: grid;
      justify-items: center;
      gap: var(--space-2);
      padding: var(--space-8) var(--space-5);
      text-align: center;
    }

    .error-state__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 3rem;
      height: 3rem;
      margin-bottom: var(--space-2);
      border-radius: var(--radius-pill);
      background-color: var(--block-soft);
      color: var(--block-ink);
    }

    .error-state__title {
      margin: 0;
    }

    .error-state__message {
      max-width: 32ch;
      margin: 0 0 var(--space-3);
    }
  `,
})
export class ErrorState {
  readonly title = input('Ceva n-a mers');
  readonly message = input.required<string>();
  readonly retry = output<void>();
}
