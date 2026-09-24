/**
 * Configurarea implicita (build de productie).
 *
 * `environment.development.ts` o inlocuieste la `ng serve` / build de development,
 * prin `fileReplacements` din angular.json — vezi acolo.
 */
export const environment = {
  production: true,

  /**
   * Prefixul tuturor apelurilor catre API. Relativ, deci in productie frontendul
   * si API-ul sunt servite de pe aceeasi origine si nu avem nevoie de CORS.
   */
  apiBaseUrl: '/api',
};
