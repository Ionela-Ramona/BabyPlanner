import { Routes } from '@angular/router';

import { DashboardPage } from './dashboard-page/dashboard-page';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardPage,
    title: 'Dashboard · BabyPlanner',
  },
];
