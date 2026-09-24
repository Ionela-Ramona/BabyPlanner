import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  styles: `
    :host {
      display: block;
    }

    .not-found {
      max-width: 34rem;
    }
  `,
  template: `
    <h1>Pagina nu există</h1>

    <div class="card not-found">
      <p>Adresa pe care ai accesat-o nu corespunde niciunei pagini din aplicație.</p>
      <a routerLink="/dashboard">Înapoi la dashboard</a>
    </div>
  `,
})
export class NotFound {}
