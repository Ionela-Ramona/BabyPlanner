import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentType } from '@angular/cdk/portal';
import { Injector } from '@angular/core';

import { SheetContainer } from './sheet-container';
import type { SheetOptions } from './sheet.service';

/**
 * Partea grea a foii: `@angular/cdk/dialog`, overlay-ul si containerul. Sta intr-un
 * modul separat pe care `SheetService` il incarca abia la prima deschidere, ca cei
 * ~65 kB de CDK sa nu intarzie prima afisare a aplicatiei (BP-UI-18, LCP).
 */
export function openSheet<C, D, R>(
  injector: Injector,
  component: ComponentType<C>,
  options: SheetOptions<D>,
): DialogRef<R, C> {
  const overlay = injector.get(Overlay);
  const config: DialogConfig<D, DialogRef<R, C>> = {
    data: options.data ?? null,
    container: SheetContainer,
    panelClass: 'bp-sheet-pane',
    backdropClass: 'bp-scrim',
    ariaLabelledBy: options.ariaLabelledBy ?? null,
    ariaLabel: options.ariaLabelledBy ? null : (options.title ?? null),
    ariaDescribedBy: options.ariaDescribedBy ?? null,
    autoFocus: 'first-tabbable',
    positionStrategy: overlay.position().global().centerHorizontally().centerVertically(),
  };
  return injector.get(Dialog).open<R, D, C>(component, config);
}
