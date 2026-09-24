/**
 * Configurarea pentru development.
 *
 * `apiBaseUrl` ramane relativ si in development: cererile catre /api sunt
 * redirectionate de dev server catre backend prin proxy.conf.json. Asa browserul
 * vede o singura origine (localhost:4200) si nu se declanseaza deloc CORS.
 */
export const environment = {
  production: false,
  apiBaseUrl: '/api',
};
