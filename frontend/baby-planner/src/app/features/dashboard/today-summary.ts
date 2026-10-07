import { Activity } from '../../core/models/activity';
import { ACTIVITY_TYPES, ActivityType } from '../../core/models/activity-type';
import { partOfDay } from '../../shared/utils/ro-time';

/**
 * Calculele pure din spatele paginii Azi: dalele de rezumat si gruparea
 * cronologiei. Stau separat de componenta ca sa poata fi testate fara DOM.
 */

/** Tipurile cu rand mare pe Azi; celelalte (rare) stau pe un singur rand, mai mic. */
export const CORE_TYPES: readonly ActivityType[] = ['Feeding', 'Sleep', 'Diaper'];

/** Rezumatul unui tip: cate au fost azi si care e cea mai recenta (poate fi de ieri). */
export interface TypeSummary {
  readonly type: ActivityType;
  readonly count: number;
  readonly last?: Activity;
  /** Suma ml de azi; lipseste cand nicio masa n-are cantitatea notata (nu aratam "0 ml"). */
  readonly totalMl?: number;
  /** Suma minutelor de azi (somnuri incheiate, alaptari); lipseste fara durate notate. */
  readonly totalMinutes?: number;
}

export type PartOfDay = ReturnType<typeof partOfDay>;

export interface TimelineGroup {
  readonly label: PartOfDay;
  readonly activities: readonly Activity[];
}

// Comparam momente, nu siruri: precizia fractiunilor de secunda difera intre raspunsuri.
function instant(activity: Activity): number {
  return Date.parse(activity.occurredAt);
}

/** Cele mai noi primele; la egalitate de ora, cea adaugata ultima (id mai mare) sus. */
export function newestFirst(list: readonly Activity[]): Activity[] {
  return [...list].sort((a, b) => instant(b) - instant(a) || b.id - a.id);
}

/**
 * Un rezumat pentru fiecare tip, in ordinea din ACTIVITY_TYPES — si pentru cele fara
 * nimic azi, fiindca fiecare dala e si butonul care noteaza tipul.
 *
 * `latest` (din /latest) e ultima activitate a fiecarui tip, indiferent de zi: dupa
 * miezul noptii, "ultima masa" ramane cea de aseara, nu dispare. Numaratoarea si
 * totalurile raman doar pentru azi.
 */
export function summarizeToday(list: readonly Activity[], latest: readonly Activity[] = []): TypeSummary[] {
  return ACTIVITY_TYPES.map((type) => {
    const ofType = newestFirst(list.filter((activity) => activity.type === type));
    return {
      type,
      count: ofType.length,
      // Cea mai noua dintre cele doua: imediat dupa o salvare, oricare poate fi cu un pas in urma.
      last: newestFirst([...ofType.slice(0, 1), ...latest.filter((activity) => activity.type === type)])[0],
      totalMl: sumOf(ofType, (activity) => activity.amountMl),
      totalMinutes: sumOf(ofType, (activity) => activity.durationMinutes),
    };
  });
}

/**
 * Suma valorilor notate, sau `undefined` daca niciuna nu e notata. Totalurile vin
 * doar din campurile structurate — notitele nu sunt niciodata citite ca numere.
 */
function sumOf(
  list: readonly Activity[],
  pick: (activity: Activity) => number | null | undefined,
): number | undefined {
  const values = list.map(pick).filter((value): value is number => typeof value === 'number');
  return values.length ? values.reduce((sum, value) => sum + value, 0) : undefined;
}

/** Somnul care inca dureaza (cel mai recent, daca sunt mai multe), sau `undefined`. */
export function ongoingSleep(list: readonly Activity[]): Activity | undefined {
  return newestFirst(list.filter((activity) => activity.type === 'Sleep' && activity.inProgress))[0];
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
