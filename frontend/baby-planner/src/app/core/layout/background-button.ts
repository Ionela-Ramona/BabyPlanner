import { Component, inject } from '@angular/core';

import { IconButton } from '../../shared/components/icon-button/icon-button';
import { SheetService } from '../../shared/overlays/sheet.service';

/**
 * Butonul din bara de sus care deschide foaia "Culoarea fundalului".
 *
 * Foaia se incarca lazy (`import()`), ca si foaia de logare: majoritatea vizitelor
 * nu o deschid, deci codul ei nu are ce cauta in bundle-ul initial.
 */
@Component({
  selector: 'app-background-button',
  imports: [IconButton],
  template: `
    <button
      app-icon-button
      icon="palette"
      label="Culoarea fundalului"
      aria-haspopup="dialog"
      (click)="open()"
    ></button>
  `,
})
export class BackgroundButton {
  private readonly sheets = inject(SheetService);

  protected async open(): Promise<void> {
    const { BackgroundSheet } = await import('./background-sheet');
    this.sheets.open(BackgroundSheet, { ariaLabelledBy: 'background-title' });
  }
}
