import { ActivityType } from '../../core/models/activity-type';

/**
 * Helperi puri pentru timp si varsta in limba romana.
 *
 * Nicio functie de aici nu citeste ceasul sistemului — "acum"/"azi" vin mereu ca
 * parametru (vezi core/services/clock.ts), ca testele sa fie deterministe si ca
 * regula "nu presupune new Date()" din CLAUDE.md sa fie respectata si aici.
 */

// ---------------------------------------------------------------------------
// Parsare si comparatii de date
// ---------------------------------------------------------------------------

/**
 * Parseaza un "YYYY-MM-DD" ca data calendaristica locala.
 *
 * `new Date('YYYY-MM-DD')` interpreteaza sirul ca UTC (ora 00:00 UTC), ceea ce
 * muta data cu o zi in urma pentru orice fus la vest de Greenwich. Bebelusul
 * nu s-a nascut in UTC, deci construim data din componente, in fusul local.
 */
export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Compara doar anul/luna/ziua, ignorand ora. */
export function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function toDate(instant: Date | string): Date {
  return typeof instant === 'string' ? new Date(instant) : instant;
}

function toMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Numarul de zile calendaristice dintre doua date locale (poate fi negativ). */
function daysBetween(from: Date, to: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = toMidnight(to).getTime() - toMidnight(from).getTime();
  // Round, nu floor: o ora de vara/iarna poate face ziua 23h sau 25h.
  return Math.round(diff / msPerDay);
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * Numarul de luni calendaristice complete intre doua date (25 martie -> 25
 * septembrie = 6 luni). Pentru date fara corespondent in luna tinta (31
 * ianuarie, 29 februarie), ziua de start se plafoneaza la ultima zi a lunii
 * tinta, ca luna sa se considere incheiata la limita ei naturala.
 */
function monthsBetween(from: Date, to: Date): number {
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  const clampedStartDay = Math.min(from.getDate(), daysInMonth(to.getFullYear(), to.getMonth()));
  if (to.getDate() < clampedStartDay) {
    months -= 1;
  }
  return Math.max(months, 0);
}

// ---------------------------------------------------------------------------
// Numaratori cu pluralul romanesc (regula "de" la 20+)
// ---------------------------------------------------------------------------

/** Substantivele folosite in numaratori, cu forma de singular si plural. */
export const RO_NOUNS = {
  masă: { singular: 'masă', plural: 'mese' },
  somn: { singular: 'somn', plural: 'somnuri' },
  scutec: { singular: 'scutec', plural: 'scutece' },
  medicament: { singular: 'medicament', plural: 'medicamente' },
  activitate: { singular: 'activitate', plural: 'activități' },
  minut: { singular: 'minut', plural: 'minute' },
  oră: { singular: 'oră', plural: 'ore' },
  zi: { singular: 'zi', plural: 'zile' },
  săptămână: { singular: 'săptămână', plural: 'săptămâni' },
  lună: { singular: 'lună', plural: 'luni' },
  an: { singular: 'an', plural: 'ani' },
} as const;

export type RoNoun = keyof typeof RO_NOUNS;

/** Substantivul de folosit pentru fiecare tip de activitate ("2 mese", "3 scutece"). */
export const ACTIVITY_NOUN: Record<ActivityType, RoNoun> = {
  Feeding: 'masă',
  Sleep: 'somn',
  Diaper: 'scutec',
  Medicine: 'medicament',
  Other: 'activitate',
};

const PLURAL_RULES = new Intl.PluralRules('ro');

/**
 * Formateaza un numar cu substantivul romanesc corect: "1 masă", "3 mese",
 * "20 de mese". Categoria vine din Intl.PluralRules('ro'), care implementeaza
 * regula CLDR (one = 1; few = 0 sau %100 in 1..19, exceptand 1; other = restul,
 * unde intra si regula "de").
 */
export function countLabel(n: number, noun: RoNoun): string {
  const forms = RO_NOUNS[noun];
  const category = PLURAL_RULES.select(n);
  if (category === 'one') {
    return `${n} ${forms.singular}`;
  }
  if (category === 'few') {
    return `${n} ${forms.plural}`;
  }
  return `${n} de ${forms.plural}`;
}

// ---------------------------------------------------------------------------
// Varsta
// ---------------------------------------------------------------------------

/**
 * Varsta afisata in interfata: zile pana la 13, saptamani pana sub 2 luni,
 * luni pana sub 1 an, apoi ani (+ luni ramase daca nu cad exact).
 *
 * Exemple: "prima zi", "3 zile", "2 săptămâni", "6 luni", "1 an și 2 luni".
 */
export function ageLabel(dateOfBirth: string, today: Date): string {
  const birth = parseDateOnly(dateOfBirth);
  const days = daysBetween(birth, today);

  if (days <= 0) {
    return 'prima zi';
  }
  if (days < 14) {
    return countLabel(days, 'zi');
  }

  const months = monthsBetween(birth, today);
  if (months < 2) {
    return countLabel(Math.floor(days / 7), 'săptămână');
  }
  if (months < 12) {
    return countLabel(months, 'lună');
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return remainingMonths === 0
    ? countLabel(years, 'an')
    : `${countLabel(years, 'an')} și ${countLabel(remainingMonths, 'lună')}`;
}

// ---------------------------------------------------------------------------
// Timp relativ si etichete de ora/zi
// ---------------------------------------------------------------------------

const RELATIVE_FORMATTER = new Intl.RelativeTimeFormat('ro', { numeric: 'auto' });

/**
 * "acum", "acum 5 minute", "acum 2 ore", "ieri", "acum 3 zile"...
 * Sub 1 minut raspundem direct "acum" (RelativeTimeFormat ar zice acelasi
 * lucru la 0, dar nu si pentru restul secundelor din minutul curent).
 */
export function relativeLabel(instant: Date | string, now: Date): string {
  const then = toDate(instant);
  const diffMs = then.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMs / 1_000);

  if (Math.abs(diffSeconds) < 60) {
    return 'acum';
  }

  const diffMinutes = Math.round(diffMs / 60_000);
  if (Math.abs(diffMinutes) < 60) {
    return RELATIVE_FORMATTER.format(diffMinutes, 'minute');
  }

  const diffHours = Math.round(diffMs / 3_600_000);
  if (Math.abs(diffHours) < 24) {
    return RELATIVE_FORMATTER.format(diffHours, 'hour');
  }

  const diffDays = Math.round(diffMs / 86_400_000);
  return RELATIVE_FORMATTER.format(diffDays, 'day');
}

const TIME_FORMATTER = new Intl.DateTimeFormat('ro', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/** "16:04", ora locala, format 24h. */
export function timeLabel(instant: Date | string): string {
  return TIME_FORMATTER.format(toDate(instant));
}

/** Segmentul zilei folosit pentru gruparea cronologiei. */
export function partOfDay(instant: Date | string): 'Noaptea' | 'Dimineața' | 'După-amiaza' | 'Seara' {
  const hour = toDate(instant).getHours();
  if (hour < 6) return 'Noaptea';
  if (hour < 12) return 'Dimineața';
  if (hour < 18) return 'După-amiaza';
  return 'Seara';
}

const DAY_HEADER_FORMATTER = new Intl.DateTimeFormat('ro', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

const DAY_HEADER_FORMATTER_WITH_YEAR = new Intl.DateTimeFormat('ro', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** "Azi", "Ieri", altfel "joi, 18 septembrie" (+ anul, daca difera de anul curent). */
export function dayHeader(instant: Date | string, today: Date): string {
  const date = toDate(instant);
  if (isSameLocalDay(date, today)) {
    return 'Azi';
  }

  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  if (isSameLocalDay(date, yesterday)) {
    return 'Ieri';
  }

  const formatter =
    date.getFullYear() === today.getFullYear() ? DAY_HEADER_FORMATTER : DAY_HEADER_FORMATTER_WITH_YEAR;
  return formatter.format(date);
}

// ---------------------------------------------------------------------------
// Conversie pentru <input type="datetime-local">
// ---------------------------------------------------------------------------

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** Data locala -> "YYYY-MM-DDTHH:mm", formatul asteptat de datetime-local. */
export function toLocalInputValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** "YYYY-MM-DDTHH:mm" (ora locala din formular) -> ISO UTC, gata de trimis la API. */
export function fromLocalInputValue(value: string): string {
  const [datePart, timePart] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute).toISOString();
}
