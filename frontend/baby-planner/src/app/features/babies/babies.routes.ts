import { Routes } from '@angular/router';

import { BabyList } from './baby-list/baby-list';

/**
 * Activitatile stau sub bebelus si in URL (`/babies/1/activities`), exact ca in API
 * (`/api/babies/{babyId}/activities`). Asa relatia dintre cele doua e vizibila
 * din adresa, iar `babyId` ajunge in componenta ca parametru de ruta.
 */
export const babiesRoutes: Routes = [
  {
    path: '',
    component: BabyList,
    title: 'Bebeluși · BabyPlanner',
  },
  {
    path: ':babyId/activities',
    loadChildren: () =>
      import('../activities/activities.routes').then((m) => m.activitiesRoutes),
  },
];
