import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';

import { QuickLogData } from '../../core/services/quick-log-launcher';
import { SheetHeader } from '../../shared/overlays/sheet-header';

/**
 * Foaia de logare rapida. Schelet pus de shell (BP-UI-11) ca "＋ Adaugă" sa aiba
 * ce deschide; fluxul complet (alegi tipul, salvezi, Anuleaza) vine in BP-UI-15.
 */
@Component({
  selector: 'app-quick-log-sheet',
  imports: [SheetHeader],
  template: `
    <app-sheet-header
      id="quick-log-title"
      [title]="'Ce notăm pentru ' + data.babyName + '?'"
      (close)="dialogRef.close()"
    />
  `,
})
export class QuickLogSheet {
  protected readonly data = inject<QuickLogData>(DIALOG_DATA);
  protected readonly dialogRef = inject(DialogRef);
}
