import { Routes } from '@angular/router';

/** Varianta de development a `dev-routes.ts`: aici vitrina exista. */
export const devRoutes: Routes = [
  {
    path: 'dev/components',
    loadComponent: () => import('./features/dev-showcase/showcase').then((m) => m.Showcase),
    title: 'Componente · BabyPlanner',
    data: { wide: true },
  },
];
