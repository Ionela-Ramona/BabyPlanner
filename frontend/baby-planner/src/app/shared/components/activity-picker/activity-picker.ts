import { Component, computed, input, model, output } from '@angular/core';
import { Listbox, Option } from '@angular/aria/listbox';

import { ACTIVITY_META, ACTIVITY_TYPES, ActivityType } from '../../../core/models/activity-type';
import { Icon } from '../icon/icon';

/**
 * Selectorul de tip activitate: cinci cuburi de lemn pictate, unul pe tip.
 *
 * Construit pe `ngListbox` (Angular Aria) cu `selectionMode="explicit"`: sagetile
 * doar muta cubul activ (focus), fara sa schimbe selectia — selectia se intampla
 * explicit, la clic sau la Space/Enter. Asa `picked` nu se declanseaza la navigare
 * cu tastatura, doar la activare (cerinta pentru sheet-ul de logare rapida).
 *
 * `ngListbox` tine selectia intr-un tablou (accepta selectie multipla), dar API-ul
 * nostru e cu un singur tip sau niciunul: `valueArray` face conversia intr-un sens,
 * `onListboxChange` in celalalt.
 */
@Component({
  selector: 'app-activity-picker',
  imports: [Listbox, Option, Icon],
  styleUrl: './activity-picker.scss',
  template: `
    <div
      ngListbox
      class="picker"
      [attr.aria-label]="label()"
      orientation="horizontal"
      selectionMode="explicit"
      focusMode="roving"
      [multi]="false"
      [value]="valueArray()"
      (valueChange)="onListboxChange($event)"
    >
      @for (type of types; track type) {
        <div
          ngOption
          class="picker__block"
          [value]="type"
          [label]="meta[type].label"
          [attr.data-tone]="meta[type].tone"
        >
          <span class="picker__icon">
            <app-icon [name]="meta[type].icon" [size]="28" />
          </span>
          <span class="picker__label">{{ meta[type].label }}</span>
          @if (isSelected(type)) {
            <span class="picker__check">
              <app-icon name="check" [size]="14" />
            </span>
          }
        </div>
      }
    </div>
  `,
})
export class ActivityPicker {
  /** Numele accesibil al gridului de cuburi. */
  readonly label = input('Tip activitate');

  /** Tipul ales, sau `undefined` cand niciunul nu e selectat inca. */
  readonly value = model<ActivityType | undefined>(undefined);

  /**
   * Emis doar la activare explicita (clic, Space, Enter) — nu la simpla navigare
   * cu sagetile. Sheet-ul de logare rapida asculta aici ca sa salveze la atingere.
   */
  readonly picked = output<ActivityType>();

  protected readonly types = ACTIVITY_TYPES;
  protected readonly meta = ACTIVITY_META;

  /** `ngListbox` vrea un tablou; noi expunem un singur tip. */
  protected readonly valueArray = computed<ActivityType[]>(() => {
    const current = this.value();
    return current === undefined ? [] : [current];
  });

  protected isSelected(type: ActivityType): boolean {
    return this.value() === type;
  }

  protected onListboxChange(values: readonly ActivityType[]): void {
    const next = values[0];
    this.value.set(next);
    if (next !== undefined) {
      this.picked.emit(next);
    }
  }
}
