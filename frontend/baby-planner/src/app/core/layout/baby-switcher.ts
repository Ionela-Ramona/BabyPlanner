import { Component, computed, inject } from '@angular/core';

import { Avatar } from '../../shared/components/avatar/avatar';
import { Icon } from '../../shared/components/icon/icon';
import { ActiveBaby } from '../services/active-baby';
import { BabyMenu } from './baby-menu';

/**
 * Bebelusul activ, in bara de sus.
 *
 * - niciun bebelus (sau lista inca se incarca): nu aratam nimic;
 * - un singur bebelus: avatar + nume, text simplu (un meniu cu o optiune ar fi zgomot);
 * - doi sau mai multi: butonul cu meniu din `BabyMenu`, adus cu `@defer` cand
 *   browserul e liber (sau la prima atingere). Pana atunci arata un buton identic,
 *   ca bara de sus sa nu se miste cand soseste cel adevarat.
 */
@Component({
  selector: 'app-baby-switcher',
  imports: [Avatar, BabyMenu, Icon],
  styleUrl: './baby-switcher.scss',
  template: `
    @if (active.activeBaby(); as baby) {
      @if (canSwitch()) {
        @defer (on idle; on interaction) {
          <app-baby-menu />
        } @placeholder {
          <button
            class="switcher__trigger"
            type="button"
            aria-haspopup="menu"
            [attr.aria-label]="'Bebelușul activ: ' + baby.name + '. Schimbă bebelușul'"
          >
            <app-avatar [name]="baby.name" [size]="32" />
            <span class="switcher__name">{{ baby.name }}</span>
            <app-icon class="switcher__chevron" name="chevron-down" [size]="18" />
          </button>
        }
      } @else {
        <span class="switcher__single">
          <app-avatar [name]="baby.name" [size]="32" />
          <span class="switcher__name">{{ baby.name }}</span>
        </span>
      }
    }
  `,
})
export class BabySwitcher {
  protected readonly active = inject(ActiveBaby);

  protected readonly canSwitch = computed(() => this.active.babies().length > 1);
}
