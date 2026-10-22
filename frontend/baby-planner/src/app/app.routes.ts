import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/guards/auth.guard';
import { hasBabiesGuard } from './core/guards/has-babies.guard';
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
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login-page').then((m) => m.LoginPage),
    title: 'Intră în cont · BabyPlanner',
  },
  {
    // Un parinte fara cont nu vede nimic din aplicatie. Garda sta pe parinte, nu pe
    // fiecare pagina: o pagina noua adaugata aici e protejata automat. Si ruleaza
    // inaintea garzii de bebelusi, ca aceasta sa nu ceara lista fara token.
    path: '',
    canActivateChild: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        // Un cont nou (fara bebelusi) ajunge intai la /welcome, sa-si adauge bebelusul.
        canActivate: [hasBabiesGuard],
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.dashboardRoutes),
      },
      {
        path: 'welcome',
        loadChildren: () => import('./features/welcome/welcome.routes').then((m) => m.welcomeRoutes),
      },
      {
        path: 'babies',
        loadChildren: () => import('./features/babies/babies.routes').then((m) => m.babiesRoutes),
      },
    ],
  },
  ...devRoutes,
  {
    // Trebuie sa ramana ultima: '**' prinde orice nu s-a potrivit mai sus.
    path: '**',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
    title: 'Pagină inexistentă · BabyPlanner',
  },
];
