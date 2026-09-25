import { Menu, MenuContent, MenuItem, MenuTrigger } from '@angular/aria/menu';
import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Avatar } from '../../shared/components/avatar/avatar';
import { Icon } from '../../shared/components/icon/icon';
import { ActiveBaby } from '../services/active-baby';

/** Valoarea elementului de meniu care duce la lista de bebelusi, nu la un bebelus. */
const MANAGE = 'manage';

/**
 * Bebelusul activ, in bara de sus.
 *
 * - niciun bebelus (sau lista inca se incarca): nu aratam nimic;
 * - un singur bebelus: avatar + nume, text simplu (un meniu cu o optiune ar fi zgomot);
 * - doi sau mai multi: buton care deschide un meniu Angular Aria. Tastatura (sageti,
 *   Home/End, typeahead, Esc care intoarce focusul pe buton) vine din `ngMenu`.
 *
 * Meniul sta in DOM tot timpul, pozitionat absolut sub buton; `ngMenu` pune
 * `data-visible` si il ascundem din CSS cand e inchis. Asa referinta `[menu]` a
 * butonului e disponibila din prima randare.
 */
@Component({
  selector: 'app-baby-switcher',
  imports: [Avatar, Icon, Menu, MenuContent, MenuItem, MenuTrigger],
  template: `
    @if (active.activeBaby(); as baby) {
      @if (canSwitch()) {
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
      } @else {
        <span class="switcher__single">
          <app-avatar [name]="baby.name" [size]="32" />
          <span class="switcher__name">{{ baby.name }}</span>
        </span>
      }
    }

    <div
      class="switcher__menu"
      ngMenu
      #babyMenu="ngMenu"
      (itemSelected)="onSelected($event)"
      [hidden]="!canSwitch()"
    >
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
  styles: `
    :host {
      position: relative;
      display: inline-flex;
      min-width: 0;
    }

    .switcher__trigger,
    .switcher__single {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      min-width: 0;
      min-height: var(--tap-min);
      padding: var(--space-1) var(--space-3) var(--space-1) var(--space-1);
      border-radius: var(--radius-pill);
      color: var(--color-text-strong);
      font-weight: 700;
    }

    .switcher__trigger {
      border: 1px solid var(--color-border);
      background-color: var(--paper-card);
      box-shadow: var(--shadow-sm);
      cursor: pointer;
      transition: background-color var(--dur-fast) var(--ease-out);
    }

    @media (hover: hover) {
      .switcher__trigger:hover {
        background-color: var(--paper-highlight);
      }
    }

    .switcher__trigger[aria-expanded='true'] .switcher__chevron {
      transform: rotate(180deg);
    }

    .switcher__chevron {
      flex: none;
      color: var(--color-text-muted);
      transition: transform var(--dur) var(--ease-out);
    }

    .switcher__name {
      overflow: hidden;
      max-width: 12ch;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Sub 384px ramane doar avatarul; numele e ascuns vizual, dar il citeste
       cititorul de ecran (si butonul isi pastreaza aria-label cu numele). */
    @media (max-width: 24rem) {
      .switcher__name {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip-path: inset(50%);
      }

      .switcher__trigger,
      .switcher__single {
        padding-right: var(--space-2);
      }
    }

    .switcher__menu {
      position: absolute;
      z-index: var(--z-overlay);
      top: calc(100% + var(--space-2));
      right: 0;
      display: grid;
      gap: 2px;
      min-width: 14rem;
      padding: var(--space-2);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      background-color: var(--paper-card);
      box-shadow: var(--shadow-lg);
    }

    .switcher__menu[data-visible='false'],
    .switcher__menu[hidden] {
      display: none;
    }

    .switcher__item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      min-height: var(--tap-min);
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-md);
      color: var(--color-text);
      cursor: pointer;
      outline: none;
    }

    /* Elementul activ (sageti sau hover) e cel pe care Enter il alege. */
    .switcher__item[data-active='true'] {
      background-color: var(--honey-soft);
      color: var(--ink-strong);
    }

    .switcher__item:focus-visible {
      outline: 2px solid var(--color-focus);
      outline-offset: -2px;
    }

    .switcher__item[aria-checked='true'] {
      font-weight: 700;
    }

    .switcher__item-name {
      flex: 1;
    }

    .switcher__check {
      color: var(--honey-ink);
    }

    .switcher__separator {
      height: 1px;
      margin: var(--space-1) var(--space-2);
      background-color: var(--color-border);
    }

    @media (forced-colors: active) {
      .switcher__item[data-active='true'] {
        outline: 2px solid Highlight;
      }
    }
  `,
})
export class BabySwitcher {
  protected readonly active = inject(ActiveBaby);
  private readonly router = inject(Router);

  protected readonly manage = MANAGE;
  protected readonly canSwitch = computed(() => this.active.babies().length > 1);

  protected onSelected(value: unknown): void {
    if (value === MANAGE) {
      void this.router.navigateByUrl('/babies');
    } else if (typeof value === 'number') {
      this.active.select(value);
    }
  }
}
