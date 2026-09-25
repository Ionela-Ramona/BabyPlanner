import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AddButton } from '../../shared/components/add-button/add-button';
import { Button } from '../../shared/components/button/button';
import { Edge } from '../../shared/components/edge/edge';
import { Icon } from '../../shared/components/icon/icon';
import { ActiveBaby } from '../services/active-baby';
import { QuickLogLauncher } from '../services/quick-log-launcher';

/**
 * Navigarea principala: bara de jos pe telefon, rail in stanga de la 64rem.
 *
 * Un singur `<nav>` in DOM pentru ambele forme (CSS schimba asezarea), ca un
 * cititor de ecran sa gaseasca o singura regiune "Navigare principală". In DOM
 * sta dupa `<main>`, deci ordinea Tab e: bara de sus → continut → navigare.
 *
 * "＋ Adaugă" apare de doua ori, dar niciodata vizibil simultan: cubul de miere
 * ridicat in bara de jos si butonul lat din capul rail-ului. Cel ascuns are
 * `display: none`, deci iese si din arborele de accesibilitate.
 */
@Component({
  selector: 'app-main-nav',
  imports: [AddButton, Button, Edge, Icon, RouterLink, RouterLinkActive],
  template: `
    <nav class="nav" aria-label="Navigare principală">
      <app-edge class="nav__edge" position="top" />

      <button
        class="nav__add-wide"
        type="button"
        appButton
        variant="primary"
        size="lg"
        block
        (click)="add()"
      >
        <app-icon name="plus" [size]="22" />
        Adaugă
      </button>

      <ul class="nav__list">
        <li class="nav__slot">
          <a
            class="nav__link"
            routerLink="/dashboard"
            routerLinkActive="is-active"
            ariaCurrentWhenActive="page"
          >
            <app-icon name="today" [size]="24" />
            <span class="nav__label">Azi</span>
          </a>
        </li>

        <li class="nav__slot nav__slot--add">
          <button class="nav__add" app-add-button (click)="add()"></button>
        </li>

        <li class="nav__slot">
          @if (historyLink(); as link) {
            <a
              class="nav__link"
              [routerLink]="link"
              routerLinkActive="is-active"
              ariaCurrentWhenActive="page"
            >
              <app-icon name="history" [size]="24" />
              <span class="nav__label">Istoric</span>
            </a>
          } @else {
            <!-- Fara bebelus nu exista istoric; ramane pe loc, ca bara sa nu sara. -->
            <span class="nav__link nav__link--disabled" aria-disabled="true" role="link">
              <app-icon name="history" [size]="24" />
              <span class="nav__label">Istoric</span>
            </span>
          }
        </li>

        <li class="nav__slot">
          <a
            class="nav__link"
            routerLink="/babies"
            routerLinkActive="is-active"
            ariaCurrentWhenActive="page"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            <app-icon name="babies" [size]="24" />
            <span class="nav__label">Bebeluși</span>
          </a>
        </li>
      </ul>
    </nav>
  `,
  styleUrl: './main-nav.scss',
})
export class MainNav {
  private readonly activeBaby = inject(ActiveBaby);
  private readonly quickLog = inject(QuickLogLauncher);

  protected readonly historyLink = computed(() => {
    const id = this.activeBaby.activeId();
    return id === undefined ? null : `/babies/${id}/activities`;
  });

  protected add(): void {
    void this.quickLog.open();
  }
}
