import { Component, computed, input, model } from '@angular/core';
import { Listbox, Option } from '@angular/aria/listbox';

import { ACTIVITY_META, ACTIVITY_TYPES, ActivityTone, ActivityType } from '../../../core/models/activity-type';
import { IconName } from '../icon/icon-names';
import { Icon } from '../icon/icon';

interface ChipItem {
  readonly value: ActivityType | undefined;
  readonly label: string;
  readonly icon?: IconName;
  readonly tone: ActivityTone | 'honey';
}

/**
 * Chip-urile de filtrare dupa tip: "Toate" + cele cinci tipuri, inlocuiesc
 * `<select id="type-filter">`. Selectie unica (API-ul are un singur `?type=`),
 * construita pe `ngListbox` cu `selectionMode="follow"`: sagetile schimba filtrul
 * imediat, ca intr-un radiogroup — la fel de direct ca vechiul `<select>`, dar
 * fara sa mai deschizi un meniu al sistemului de operare.
 *
 * "Toate" e reprezentat de valoarea `undefined`, la fel ca lipsa parametrului
 * `?type=` din URL.
 */
@Component({
  selector: 'app-filter-chips',
  imports: [Listbox, Option, Icon],
  styleUrl: './filter-chips.scss',
  template: `
    <div class="chips-scroller">
      <div
        ngListbox
        class="chips"
        [attr.aria-label]="ariaLabel()"
        orientation="horizontal"
        selectionMode="follow"
        focusMode="roving"
        [multi]="false"
        [value]="valueArray()"
        (valueChange)="onListboxChange($event)"
      >
        @for (item of items; track item.label) {
          <div
            ngOption
            class="chip"
            [value]="item.value"
            [label]="item.label"
            [attr.data-tone]="item.tone"
          >
            @if (item.icon) {
              <app-icon [name]="item.icon" [size]="18" />
            }
            <span>{{ item.label }}</span>
          </div>
        }
      </div>
    </div>
  `,
})
export class FilterChips {
  /** Numele accesibil al listei de chip-uri. */
  readonly ariaLabel = input('Filtrează după tip');

  /** Tipul ales, sau `undefined` pentru "Toate". */
  readonly value = model<ActivityType | undefined>(undefined);

  protected readonly items: readonly ChipItem[] = [
    { value: undefined, label: 'Toate', tone: 'honey' },
    ...ACTIVITY_TYPES.map((type) => ({
      value: type,
      label: ACTIVITY_META[type].label,
      icon: ACTIVITY_META[type].icon,
      tone: ACTIVITY_META[type].tone,
    })),
  ];

  protected readonly valueArray = computed<(ActivityType | undefined)[]>(() => [this.value()]);

  protected onListboxChange(values: readonly (ActivityType | undefined)[]): void {
    this.value.set(values[0]);
  }
}
