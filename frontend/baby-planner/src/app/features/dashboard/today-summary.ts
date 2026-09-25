import { Activity } from '../../core/models/activity';
import { ACTIVITY_TYPES, ActivityType } from '../../core/models/activity-type';
import { partOfDay } from '../../shared/utils/ro-time';

/**
 * Calculele pure din spatele paginii Azi: dalele de rezumat si gruparea
 * cronologiei. Stau separat de componenta ca sa poata fi testate fara DOM.
 */

/** Tipurile care au mereu o dala, chiar si cand azi nu s-a notat nimic. */
export const CORE_TYPES: readonly ActivityType[] = ['Feeding', 'Sleep', 'Diaper'];

/** Rezumatul unui tip pentru ziua de azi: cate au fost si care e cea mai recenta. */
export interface TypeSummary {
  readonly type: ActivityType;
  readonly count: number;
  readonly last?: Activity;
}

export type PartOfDay = ReturnType<typeof partOfDay>;

export interface TimelineGroup {
  readonly label: PartOfDay;
  readonly activities: readonly Activity[];
}

/**
 * Textele care depind de genul substantivului ("Nicio masă" / "Niciun somn").
 * Nu se pot deriva din ACTIVITY_META, deci le tinem intr-un singur tabel.
 */
export const TYPE_COPY: Readonly<Record<ActivityType, { none: string; add: string }>> = {
  Feeding: { none: 'Nicio masă azi', add: 'Adaugă o masă' },
  Sleep: { none: 'Niciun somn azi', add: 'Adaugă un somn' },
  Diaper: { none: 'Niciun scutec azi', add: 'Adaugă un scutec' },
  Medicine: { none: 'Niciun medicament azi', add: 'Adaugă un medicament' },
  Other: { none: 'Nimic din „Altele” azi', add: 'Adaugă o activitate' },
};

// Comparam momente, nu siruri: precizia fractiunilor de secunda difera intre raspunsuri.
function instant(activity: Activity): number {
  return Date.parse(activity.occurredAt);
}

/** Cele mai noi primele; la egalitate de ora, cea adaugata ultima (id mai mare) sus. */
export function newestFirst(list: readonly Activity[]): Activity[] {
  return [...list].sort((a, b) => instant(b) - instant(a) || b.id - a.id);
}

/** O dala pentru fiecare tip de baza, plus orice alt tip care apare azi, in ordinea din ACTIVITY_TYPES. */
export function summarizeToday(list: readonly Activity[]): TypeSummary[] {
  return ACTIVITY_TYPES.filter(
    (type) => CORE_TYPES.includes(type) || list.some((activity) => activity.type === type),
  ).map((type) => {
    const ofType = newestFirst(list.filter((activity) => activity.type === type));
    return { type, count: ofType.length, last: ofType[0] };
  });
}

/**
 * Imparte o lista deja sortata (cele mai noi primele) pe segmente ale zilei:
 * Seara, După-amiaza, Dimineața, Noaptea. Un segment fara activitati nu apare.
 */
export function groupByPartOfDay(sorted: readonly Activity[]): TimelineGroup[] {
  const groups: { label: PartOfDay; activities: Activity[] }[] = [];
  for (const activity of sorted) {
    const label = partOfDay(activity.occurredAt);
    const current = groups.at(-1);
    if (current?.label === label) {
      current.activities.push(activity);
    } else {
      groups.push({ label, activities: [activity] });
    }
  }
  return groups;
}
