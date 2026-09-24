import { Component, VERSION } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { NavBar } from './shared/components/nav-bar/nav-bar';

/**
 * Shell-ul aplicatiei: antetul, navigarea si zona in care routerul
 * randeaza pagina curenta. Nu contine logica de business.
 */
@Component({
  imports: [RouterOutlet, RouterLink, NavBar],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  /** Versiunea Angular, citita din framework — nu o tinem sincronizata de mana. */
  protected readonly angularVersion = VERSION.major;
}
