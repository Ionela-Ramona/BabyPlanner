import type { DialogRef } from '@angular/cdk/dialog';
import type { ComponentType } from '@angular/cdk/portal';
import { Injector, Service, inject } from '@angular/core';

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
 *
 * `open` e asincron: codul CDK (dialog, overlay, portal) se incarca abia la prima
 * foaie deschisa (`sheet-opener.ts`), nu odata cu aplicatia. Importurile de aici
 * sunt doar de tip, deci nu trag CDK-ul in bundle-ul initial.
 */
@Service()
export class SheetService {
  private readonly injector = inject(Injector);

  async open<C, D = unknown, R = unknown>(
    component: ComponentType<C>,
    options: SheetOptions<D> = {},
  ): Promise<DialogRef<R, C>> {
    const { openSheet } = await import('./sheet-opener');
    return openSheet<C, D, R>(this.injector, component, options);
  }
}
