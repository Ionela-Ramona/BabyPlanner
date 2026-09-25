/**
 * Numele iconitelor din `public/icons/sprite.svg`.
 *
 * Lista e un `as const`, ca `<app-icon name="...">` sa fie verificat de compilator:
 * o iconita scrisa gresit e eroare de build, nu un patrat gol in pagina.
 * Adaugi o iconita: un `<symbol id="...">` nou in sprite + numele aici.
 */
export const ICON_NAMES = [
  // Tipuri de activitate
  'feeding',
  'sleep',
  'diaper',
  'medicine',
  'other',
  // Campuri (ca in cardul din referinta)
  'calendar',
  'clock',
  'note',
  'star',
  'heart',
  // Navigare
  'today',
  'history',
  'babies',
  'plus',
  // Actiuni si stari
  'close',
  'back',
  'chevron-down',
  'chevron-right',
  'edit',
  'delete',
  'check',
  'undo',
  'refresh',
  'alert',
  // Tema
  'sun',
  'moon',
  'monitor',
] as const;

export type IconName = (typeof ICON_NAMES)[number];
