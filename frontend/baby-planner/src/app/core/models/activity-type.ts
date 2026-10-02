import { IconName } from '../../shared/components/icon/icon-names';
// Doar tipul: ro-time importa la randul lui ACTIVITY_META, iar un import de tip
// dispare la compilare, deci nu se formeaza un ciclu intre module.
import type { RoNoun } from '../../shared/utils/ro-time';

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
 * Propozitiile care depind de genul substantivului ("Nicio masă" / "Niciun somn",
 * "Masă înregistrată" / "Somn înregistrat"). Nu se pot deriva din eticheta, deci
 * fiecare tip le scrie intregi.
 */
export interface ActivityCopy {
  /** Starea goala filtrata pe Azi: "Nicio masă azi". */
  readonly noneToday: string;
  /** Starea goala filtrata in Istoric: "Nicio masă înregistrată". */
  readonly noneRecorded: string;
  /** Butonul care adauga un tip anume: "Adaugă o masă". */
  readonly add: string;
  /** Toastul de dupa salvare: "Masă înregistrată". */
  readonly logged: string;
}

export interface ActivityMeta {
  readonly label: string;
  readonly icon: IconName;
  readonly tone: ActivityTone;
  /** Substantivul din numaratori ("3 mese", "20 de scutece"), vezi `countLabel`. */
  readonly noun: RoNoun;
  readonly notesPlaceholder: string;
  readonly copy: ActivityCopy;
}

/**
 * Identitatea completa a unui tip de activitate: eticheta, iconita, familia de
 * culoare, substantivul din numaratori, textul de ajutor din campul de note si
 * propozitiile din interfata. Fiecare componenta care arata un tip (cub, chip,
 * insigna, dala, toast) citeste de aici — un tip nou inseamna valoarea din enum-ul
 * backendului, o intrare noua aici si o iconita in sprite; nimic altceva.
 */
export const ACTIVITY_META: Readonly<Record<ActivityType, ActivityMeta>> = {
  Feeding: {
    label: 'Masă',
    icon: 'feeding',
    tone: 'feeding',
    noun: 'masă',
    // Cantitatea si durata au campuri proprii (BP-UI-20); notitele raman pentru rest.
    notesPlaceholder: 'ex. lapte praf, sânul stâng',
    copy: {
      noneToday: 'Nicio masă azi',
      noneRecorded: 'Nicio masă înregistrată',
      add: 'Adaugă o masă',
      logged: 'Masă înregistrată',
    },
  },
  Sleep: {
    label: 'Somn',
    icon: 'sleep',
    tone: 'sleep',
    noun: 'somn',
    notesPlaceholder: 'ex. în pătuț, s-a trezit vesel',
    copy: {
      noneToday: 'Niciun somn azi',
      noneRecorded: 'Niciun somn înregistrat',
      add: 'Adaugă un somn',
      logged: 'Somn înregistrat',
    },
  },
  Diaper: {
    label: 'Scutec',
    icon: 'diaper',
    tone: 'diaper',
    noun: 'scutec',
    notesPlaceholder: 'ex. iritație ușoară',
    copy: {
      noneToday: 'Niciun scutec azi',
      noneRecorded: 'Niciun scutec înregistrat',
      add: 'Adaugă un scutec',
      logged: 'Scutec înregistrat',
    },
  },
  Medicine: {
    label: 'Medicamente',
    icon: 'medicine',
    tone: 'medicine',
    noun: 'medicament',
    notesPlaceholder: 'ex. Vitamina D, o picătură',
    copy: {
      noneToday: 'Niciun medicament azi',
      noneRecorded: 'Niciun medicament înregistrat',
      add: 'Adaugă un medicament',
      logged: 'Medicament înregistrat',
    },
  },
  Other: {
    label: 'Altele',
    icon: 'other',
    tone: 'other',
    noun: 'activitate',
    notesPlaceholder: 'ex. baie, plimbare',
    copy: {
      noneToday: 'Nimic din „Altele” azi',
      noneRecorded: 'Nicio activitate înregistrată',
      add: 'Adaugă o activitate',
      logged: 'Activitate înregistrată',
    },
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
