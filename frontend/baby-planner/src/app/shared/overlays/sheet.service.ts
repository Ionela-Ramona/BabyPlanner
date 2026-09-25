import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentType } from '@angular/cdk/portal';
import { Service, inject } from '@angular/core';

import { SheetContainer } from './sheet-container';

export interface SheetOptions<D = unknown> {
  /** Trimise componentei deschise, prin `DIALOG_DATA`. */
  data?: D;
  /**
   * Numele accesibil al foii, cand continutul nu isi leaga singur un `<h2>`
   * prin `ariaLabelledBy`. Foaia afiseaza vizual titlul doar daca folosesti
   * `<app-sheet-header [title]="...">` in continut — acest camp e doar pentru
   * cititorul de ecran (devine `aria-label` pe container).
   */
  title?: string;
  /** Id-ul unui element din continut (de regula un h2) care descrie foaia. */
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
}

/**
 * Foaie de jos pe telefon, panou centrat de la 48rem in sus, peste
 * `@angular/cdk/dialog`. O singura metoda `open`: capcana de focus, restaurarea
 * focusului pe elementul care a deschis foaia, inchidere pe `Esc` sau pe click
 * in afara panoului vin gratuit din `Dialog`/`CdkDialogContainer` — `SheetContainer`
 * doar adauga decorul (maner, margine festonata, scroll intern).
 */
@Service()
export class SheetService {
  private readonly dialog = inject(Dialog);
  private readonly overlay = inject(Overlay);

  open<C, D = unknown, R = unknown>(
    component: ComponentType<C>,
    options: SheetOptions<D> = {},
  ): DialogRef<R, C> {
    const config: DialogConfig<D, DialogRef<R, C>> = {
      data: options.data ?? null,
      container: SheetContainer,
      panelClass: 'bp-sheet-pane',
      backdropClass: 'bp-scrim',
      ariaLabelledBy: options.ariaLabelledBy ?? null,
      ariaLabel: options.ariaLabelledBy ? null : (options.title ?? null),
      ariaDescribedBy: options.ariaDescribedBy ?? null,
      autoFocus: 'first-tabbable',
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
    };
    return this.dialog.open<R, D, C>(component, config);
  }
}
