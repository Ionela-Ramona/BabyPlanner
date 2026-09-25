import { Component, input, output } from '@angular/core';

import { Button } from '../components/button/button';
import { Icon } from '../components/icon/icon';

/**
 * Antetul standard al unei foi: titlu (h2), subtitlu optional si butonul de
 * inchidere. Nu inchide foaia singur — emite `close` si lasa componenta care
 * gazduieste continutul sa apeleze `dialogRef.close()`, ca sa ramana refolosibil
 * si in afara unui `SheetService` (de exemplu intr-un card static).
 */
@Component({
  selector: 'app-sheet-header',
  imports: [Button, Icon],
  host: { class: 'sheet-header' },
  template: `
    <div class="sheet-header__text">
      <h2 class="sheet-header__title">{{ title() }}</h2>
      @if (subtitle(); as subtitle) {
        <p class="sheet-header__subtitle text-muted">{{ subtitle }}</p>
      }
    </div>
    <button appButton variant="ghost" type="button" class="sheet-header__close" (click)="close.emit()">
      <app-icon name="close" label="Închide" />
    </button>
  `,
  styles: `
    :host {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--space-3);
      margin-bottom: var(--space-4);
    }

    .sheet-header__title {
      margin: 0;
    }

    .sheet-header__subtitle {
      margin: var(--space-1) 0 0;
    }

    .sheet-header__close {
      flex: none;
      margin: calc(var(--space-1) * -1) calc(var(--space-2) * -1) 0 0;
      padding-inline: var(--space-2);
    }
  `,
})
export class SheetHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  // `close` e numele asteptat de toate foile; evenimentul nativ `close` vine doar
  // de la <dialog> si nu urca pana aici, deci nu se amesteca.
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly close = output<void>();
}
