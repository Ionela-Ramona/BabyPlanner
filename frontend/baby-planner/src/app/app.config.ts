import { registerLocaleData } from '@angular/common';
import localeRo from '@angular/common/locales/ro';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';

import { routes } from './app.routes';

// Fara asta, DatePipe si celelalte pipe-uri de formatare ar folosi en-US:
// "March 24, 2026" in loc de "24 martie 2026".
registerLocaleData(localeRo);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    { provide: LOCALE_ID, useValue: 'ro' },

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
