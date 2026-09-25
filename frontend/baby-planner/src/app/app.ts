import { DOCUMENT } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, skip } from 'rxjs';

import { BabySwitcher } from './core/layout/baby-switcher';
import { MainNav } from './core/layout/main-nav';
import { ThemeToggle } from './core/layout/theme-toggle';
import { ThemeService } from './core/services/theme';
import { Wordmark } from './shared/components/wordmark/wordmark';
import { ToastOutlet } from './shared/overlays/toast-outlet';

/**
 * Shell-ul aplicatiei: bara de sus, navigarea si zona in care routerul randeaza
 * pagina curenta. Nu contine logica de business.
 */
@Component({
  imports: [
    BabySwitcher,
    MainNav,
    RouterLink,
    RouterOutlet,
    ThemeToggle,
    ToastOutlet,
    Wordmark,
  ],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');
  private readonly injector = inject(Injector);

  /** Pe telefoanele cele mai inguste wordmark-ul ramane doar steaua. */
  protected readonly narrow = signal(false);

  /** Pagina curenta a cerut latimea mare (`data: { wide: true }` pe ruta). */
  protected readonly wide = signal(false);

  constructor() {
    // Serviciul de tema e creat aici, la pornire: aplica tema salvata si urmareste
    // schimbarile de sistem chiar daca comutatorul nu e inca vizibil.
    inject(ThemeService);

    this.watchNarrowScreen();

    const router = inject(Router);
    const navigations = router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      takeUntilDestroyed(),
    );

    // Paginile care cer mai mult loc (profilul pe doua coloane, vitrina) o spun
    // prin `data: { wide: true }` pe ruta; restul raman la ~45rem.
    navigations.subscribe(() => this.wide.set(this.deepestRouteIsWide(router)));

    // Dupa fiecare navigare (nu si la prima incarcare), focusul merge pe titlul
    // noii pagini: cititorul de ecran anunta pagina, iar Tab continua din continut
    // in loc sa ramana pe linkul din navigare.
    navigations
      .pipe(skip(1))
      .subscribe(() => afterNextRender({ write: () => this.focusPage() }, { injector: this.injector }));
  }

  private deepestRouteIsWide(router: Router): boolean {
    let route = router.routerState.snapshot.root;
    let wide = false;
    while (route) {
      wide = route.data['wide'] === true || wide;
      route = route.firstChild!;
    }
    return wide;
  }

  private focusPage(): void {
    const main = this.main().nativeElement;
    const heading = main.querySelector<HTMLElement>('h1');
    const target = heading ?? main;
    if (heading && !heading.hasAttribute('tabindex')) {
      heading.setAttribute('tabindex', '-1');
    }
    target.focus({ preventScroll: true });
  }

  private watchNarrowScreen(): void {
    const media = inject(DOCUMENT).defaultView?.matchMedia?.('(max-width: 29.99rem)');
    if (!media) {
      return;
    }
    this.narrow.set(media.matches);
    const listener = (event: MediaQueryListEvent) => this.narrow.set(event.matches);
    media.addEventListener?.('change', listener);
    inject(DestroyRef).onDestroy(() => media.removeEventListener?.('change', listener));
  }
}
