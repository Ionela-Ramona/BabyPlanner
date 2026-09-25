import { Routes } from '@angular/router';

import { ActivityList } from './activity-list/activity-list';

export const activitiesRoutes: Routes = [
  {
    path: '',
    component: ActivityList,
    title: 'Istoric · BabyPlanner',
  },
];
