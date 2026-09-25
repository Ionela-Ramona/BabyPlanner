import { Routes } from '@angular/router';

import { BabyFormPage } from './baby-form-page/baby-form-page';
import { BabyList } from './baby-list/baby-list';
import { BabyProfile } from './baby-profile/baby-profile';

/**
 * Activitatile stau sub bebelus si in URL (`/babies/1/activities`), exact ca in API
 * (`/api/babies/{babyId}/activities`). Asa relatia dintre cele doua e vizibila
 * din adresa, iar `babyId` ajunge in componenta ca parametru de ruta.
 *
 * `new` sta inaintea lui `:babyId`: altfel "new" ar fi citit ca un id.
 */
export const babiesRoutes: Routes = [
  {
    path: '',
    component: BabyList,
    title: 'Bebeluși · BabyPlanner',
  },
  {
    path: 'new',
    component: BabyFormPage,
    title: 'Bebeluș nou · BabyPlanner',
  },
  {
    path: ':babyId',
    component: BabyProfile,
    title: 'Profil · BabyPlanner',
    // Profilul are doua coloane pe desktop: <main> primeste latimea mare.
    data: { wide: true },
  },
  {
    path: ':babyId/edit',
    component: BabyFormPage,
    title: 'Editează · BabyPlanner',
  },
  {
    path: ':babyId/activities',
    loadChildren: () =>
      import('../activities/activities.routes').then((m) => m.activitiesRoutes),
  },
];
