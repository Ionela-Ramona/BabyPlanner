import { Routes } from '@angular/router';

import { devRoutes } from './dev-routes';

/**
 * Rutele de nivel inalt.
 *
 * Fiecare feature isi tine propriile rute in `features/<nume>/<nume>.routes.ts`
 * si se incarca lazy: codul unui ecran ajunge in browser abia cand intri pe el.
 * `title` seteaza automat titlul documentului la fiecare navigare.
 */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then((m) => m.dashboardRoutes),
  },
  {
    path: 'babies',
    loadChildren: () => import('./features/babies/babies.routes').then((m) => m.babiesRoutes),
  },
  ...devRoutes,
  {
    // Trebuie sa ramana ultima: '**' prinde orice nu s-a potrivit mai sus.
    path: '**',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
    title: 'Pagină inexistentă · BabyPlanner',
  },
];
