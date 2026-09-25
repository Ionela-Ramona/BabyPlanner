import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Button } from '../../shared/components/button/button';
import { EmptyState } from '../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-not-found',
  imports: [Button, EmptyState, RouterLink],
  template: `
    <h1 class="visually-hidden">Pagina nu există</h1>

    <app-empty-state
      framed
      priority
      illustration="cloud.svg"
      title="Aici nu e nimic de notat"
      message="Adresa nu corespunde niciunei pagini din aplicație. Poate a fost scrisă greșit sau pagina a fost mutată."
    >
      <a actions appButton routerLink="/dashboard">Înapoi la Azi</a>
    </app-empty-state>
  `,
  styles: `
    :host {
      display: block;
      padding-top: var(--space-6);
    }
  `,
})
export class NotFound {}
