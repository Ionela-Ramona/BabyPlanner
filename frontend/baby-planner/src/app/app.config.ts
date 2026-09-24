import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    // withFetch(): HttpClient foloseste Fetch API in loc de XMLHttpRequest.
    provideHttpClient(withFetch()),

    provideRouter(
      routes,
      // Parametrii de ruta (:babyId) si query params ajung direct in `input()`-urile
      // componentei, fara abonare la ActivatedRoute.
      withComponentInputBinding(),
      // La navigare sari sus in pagina; la Back revii unde erai.
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
    ),
  ],
};
