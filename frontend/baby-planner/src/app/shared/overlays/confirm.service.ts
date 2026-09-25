import { Dialog } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { Service, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ConfirmDialog, ConfirmDialogData } from './confirm-dialog';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Aproape intotdeauna adevarat: serviciul e facut pentru actiuni ireversibile. */
  destructive?: boolean;
}

/**
 * Dialog mic, centrat pe orice ecran, pentru actiuni distructive si
 * ireversibile (stergerea unui bebelus, de exemplu). Pentru actiuni
 * reversibile foloseste `ToastService` cu buton de anulare, nu confirmarea.
 */
@Service()
export class ConfirmService {
  private readonly dialog = inject(Dialog);
  private readonly overlay = inject(Overlay);

  confirm(options: ConfirmOptions): Promise<boolean> {
    const destructive = options.destructive ?? true;
    const data: ConfirmDialogData = {
      title: options.title,
      message: options.message,
      confirmLabel: options.confirmLabel,
      cancelLabel: options.cancelLabel ?? 'Anulează',
      destructive,
    };

    const ref = this.dialog.open<boolean, ConfirmDialogData, ConfirmDialog>(ConfirmDialog, {
      data,
      role: 'alertdialog',
      panelClass: 'bp-confirm-pane',
      backdropClass: 'bp-scrim',
      ariaLabel: options.title,
      // Pe o actiune ireversibila, focusul initial sta pe Anulează, niciodata
      // pe actiunea distructiva.
      autoFocus: destructive ? '[data-confirm-cancel]' : 'first-tabbable',
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
    });

    return firstValueFrom(ref.closed).then((result) => result ?? false);
  }
}
