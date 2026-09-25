import { Routes } from '@angular/router';

/**
 * Rutele de lucru (vitrina de componente). In productie lista e goala.
 *
 * Nu folosim `environment.production ? [...] : []`: `import()`-ul din ramura
 * nefolosita tot ar fi pastrat de bundler si vitrina ar ajunge in build.
 * In development, angular.json inlocuieste fisierul cu `dev-routes.development.ts`
 * (acelasi mecanism ca la environment.ts).
 */
export const devRoutes: Routes = [];
