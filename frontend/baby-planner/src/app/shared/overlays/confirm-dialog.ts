import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';

import { Button } from '../components/button/button';
import { Icon } from '../components/icon/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive: boolean;
}

/**
 * Continutul dialogului de confirmare, deschis de `ConfirmService`. Nu se
 * foloseste direct: e o componenta interna, cu date fixe (`ConfirmDialogData`).
 */
@Component({
  selector: 'app-confirm-dialog',
  imports: [Button, Icon],
  host: { class: 'confirm-dialog' },
  template: `
    <div class="confirm-dialog__icon" [attr.data-tone]="data.destructive ? 'danger' : 'info'" aria-hidden="true">
      <app-icon [name]="data.destructive ? 'alert' : 'check'" />
    </div>
    <h2 class="confirm-dialog__title">{{ data.title }}</h2>
    <p class="confirm-dialog__message text-muted">{{ data.message }}</p>
    <div class="confirm-dialog__actions">
      <button appButton variant="secondary" type="button" data-confirm-cancel (click)="dialogRef.close(false)">
        {{ data.cancelLabel }}
      </button>
      <button
        appButton
        [variant]="data.destructive ? 'danger' : 'primary'"
        type="button"
        (click)="dialogRef.close(true)"
      >
        {{ data.confirmLabel }}
      </button>
    </div>
  `,
  styles: `
    :host {
      display: block;
      padding: var(--space-6) var(--space-5) var(--space-5);
      transition:
        transform var(--dur) var(--ease-out),
        opacity var(--dur) var(--ease-out);
    }

    @starting-style {
      :host {
        transform: scale(0.96);
        opacity: 0;
      }
    }

    .confirm-dialog__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 3rem;
      height: 3rem;
      margin-bottom: var(--space-4);
      border-radius: var(--radius-lg);
      background-color: var(--block-soft);
      color: var(--block-ink);
    }

    .confirm-dialog__title {
      margin-bottom: var(--space-2);
    }

    .confirm-dialog__message {
      margin-bottom: var(--space-5);
    }

    .confirm-dialog__actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      justify-content: flex-end;
    }
  `,
})
export class ConfirmDialog {
  protected readonly dialogRef = inject<DialogRef<boolean, ConfirmDialog>>(DialogRef);
  protected readonly data = inject<ConfirmDialogData>(DIALOG_DATA);
}
