import { IconName } from '../../shared/components/icon/icon-names';

/**
 * Tipurile de activitate.
 *
 * Backendul le serializeaza ca text ("Feeding"), nu ca numere — vezi
 * JsonStringEnumConverter din Program.cs. Folosim o lista `as const` plus un union
 * type, nu un `enum` TypeScript: valorile sunt exact sirurile care circula pe fir,
 * iar ACTIVITY_TYPES ne da si o lista iterabila pentru filtre si formulare.
 */
export const ACTIVITY_TYPES = ['Feeding', 'Sleep', 'Diaper', 'Medicine', 'Other'] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

/** Familia de culoare a unui tip, adica valoarea atributului `[data-tone]` (_surfaces.scss). */
export type ActivityTone = 'feeding' | 'sleep' | 'diaper' | 'medicine' | 'other';

/**
 * Identitatea completa a unui tip de activitate: eticheta, iconita, familia de
 * culoare si textul de ajutor din campul de note. Fiecare componenta care arata
 * un tip (cub, chip, insigna) citeste de aici — un tip nou inseamna o singura
 * intrare noua, niciun cod nu are tipurile "hardcodate" in alta parte.
 */
export const ACTIVITY_META: Readonly<
  Record<
    ActivityType,
    { label: string; icon: IconName; tone: ActivityTone; notesPlaceholder: string }
  >
> = {
  Feeding: {
    label: 'Masă',
    icon: 'feeding',
    tone: 'feeding',
    notesPlaceholder: 'ex. 120 ml lapte praf sau alăptat 15 minute',
  },
  Sleep: {
    label: 'Somn',
    icon: 'sleep',
    tone: 'sleep',
    notesPlaceholder: 'ex. a dormit 45 de minute',
  },
  Diaper: {
    label: 'Scutec',
    icon: 'diaper',
    tone: 'diaper',
    notesPlaceholder: 'ex. ud sau murdar',
  },
  Medicine: {
    label: 'Medicamente',
    icon: 'medicine',
    tone: 'medicine',
    notesPlaceholder: 'ex. Vitamina D, o picătură',
  },
  Other: {
    label: 'Altele',
    icon: 'other',
    tone: 'other',
    notesPlaceholder: 'ex. baie, plimbare',
  },
};

/** Etichetele afisate in interfata. Derivate din ACTIVITY_META, ca sa nu existe doua surse de adevar. */
export const ACTIVITY_TYPE_LABELS: Readonly<Record<ActivityType, string>> = Object.fromEntries(
  ACTIVITY_TYPES.map((type) => [type, ACTIVITY_META[type].label]),
) as Readonly<Record<ActivityType, string>>;

/**
 * Verifica daca o valoare venita din exterior (query string, formular) este un
 * tip valid. Orice altceva e tratat ca „fara filtru", nu trimis mai departe la API.
 */
export function isActivityType(value: unknown): value is ActivityType {
  return typeof value === 'string' && (ACTIVITY_TYPES as readonly string[]).includes(value);
}
