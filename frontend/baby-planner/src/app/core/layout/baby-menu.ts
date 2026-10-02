import { Menu, MenuContent, MenuItem, MenuTrigger } from '@angular/aria/menu';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Avatar } from '../../shared/components/avatar/avatar';
import { Icon } from '../../shared/components/icon/icon';
import { ActiveBaby } from '../services/active-baby';

/** Valoarea elementului de meniu care duce la lista de bebelusi, nu la un bebelus. */
const MANAGE = 'manage';

/**
 * Butonul + meniul Angular Aria cu care schimbi bebelusul activ (doi sau mai multi
 * bebelusi). Tastatura (sageti, Home/End, typeahead, Esc care intoarce focusul pe
 * buton) vine din `ngMenu`.
 *
 * Sta separat de `BabySwitcher` ca sa poata fi incarcat cu `@defer`: Angular Aria
 * menu (~30 kB) nu mai intra in bundle-ul initial, iar cine are un singur bebelus
 * nu-l descarca deloc.
 *
 * Meniul sta in DOM tot timpul, pozitionat absolut sub buton; `ngMenu` pune
 * `data-visible` si il ascundem din CSS cand e inchis. Asa referinta `[menu]` a
 * butonului e disponibila din prima randare.
 */
@Component({
  selector: 'app-baby-menu',
  imports: [Avatar, Icon, Menu, MenuContent, MenuItem, MenuTrigger],
  styleUrl: './baby-switcher.scss',
  template: `
    @if (active.activeBaby(); as baby) {
      <button
        class="switcher__trigger"
        type="button"
        ngMenuTrigger
        [menu]="babyMenu"
        [attr.aria-label]="'Bebelușul activ: ' + baby.name + '. Schimbă bebelușul'"
      >
        <app-avatar [name]="baby.name" [size]="32" />
        <span class="switcher__name">{{ baby.name }}</span>
        <app-icon class="switcher__chevron" name="chevron-down" [size]="18" />
      </button>
    }

    <div class="switcher__menu" ngMenu #babyMenu="ngMenu" (itemSelected)="onSelected($event)">
      <ng-template ngMenuContent>
        @for (baby of active.babies(); track baby.id) {
          <div
            class="switcher__item"
            ngMenuItem
            role="menuitemradio"
            [value]="baby.id"
            [searchTerm]="baby.name"
            [attr.aria-checked]="baby.id === active.activeId()"
          >
            <app-avatar [name]="baby.name" [size]="28" />
            <span class="switcher__item-name">{{ baby.name }}</span>
            @if (baby.id === active.activeId()) {
              <app-icon class="switcher__check" name="check" [size]="18" />
            }
          </div>
        }
        <div class="switcher__separator" role="separator"></div>
        <div class="switcher__item" ngMenuItem [value]="manage" searchTerm="Toți bebelușii">
          <app-icon name="babies" [size]="20" />
          <span class="switcher__item-name">Toți bebelușii</span>
        </div>
      </ng-template>
    </div>
  `,
})
export class BabyMenu {
  protected readonly active = inject(ActiveBaby);
  private readonly router = inject(Router);

  protected readonly manage = MANAGE;

  protected onSelected(value: unknown): void {
    if (value === MANAGE) {
      void this.router.navigateByUrl('/babies');
    } else if (typeof value === 'number') {
      this.active.select(value);
    }
  }
}
