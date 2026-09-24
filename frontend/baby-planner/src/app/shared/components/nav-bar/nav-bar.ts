import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavLink {
  readonly path: string;
  readonly label: string;
}

/**
 * Navigarea principala a aplicatiei.
 *
 * `routerLinkActive` adauga clasa cand ruta e activa, iar `ariaCurrentWhenActive`
 * pune `aria-current="page"` — asa si utilizatorii de screen reader stiu pe ce
 * pagina sunt, nu doar cei care vad evidentierea vizuala.
 */
@Component({
  selector: 'app-nav-bar',
  imports: [RouterLink, RouterLinkActive],
  styleUrl: './nav-bar.scss',
  template: `
    <nav aria-label="Navigare principală">
      <ul class="nav-list">
        @for (link of links; track link.path) {
          <li>
            <a
              class="nav-link"
              [routerLink]="link.path"
              routerLinkActive="nav-link--active"
              ariaCurrentWhenActive="page"
            >
              {{ link.label }}
            </a>
          </li>
        }
      </ul>
    </nav>
  `,
})
export class NavBar {
  protected readonly links: readonly NavLink[] = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/babies', label: 'Bebeluși' },
  ];
}
