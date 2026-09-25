import { Routes } from '@angular/router';

import { DashboardPage } from './dashboard-page/dashboard-page';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardPage,
    title: 'Azi · BabyPlanner',
    // Pe desktop dalele si cronologia stau pe doua coloane: pagina cere latimea mare.
    data: { wide: true },
  },
];
