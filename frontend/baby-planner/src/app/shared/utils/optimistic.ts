import { Activity } from '../../core/models/activity';

/**
 * Helperi puri pentru actualizarea optimista a listelor de activitati.
 *
 * Fiecare functie intoarce un array nou si nu modifica lista primita — o
 * componenta poate deci pastra lista veche intr-o variabila si o poate pune
 * la loc (rollback) daca cererea catre server esueaza dupa o actualizare
 * optimista.
 */

/** Insereaza o activitate, pastrand ordinea descrescatoare dupa `occurredAt` (cele mai noi primele). */
export function insertActivity(list: readonly Activity[], activity: Activity): Activity[] {
  const activityTime = new Date(activity.occurredAt).getTime();
  const insertAt = list.findIndex((item) => new Date(item.occurredAt).getTime() < activityTime);
  const index = insertAt === -1 ? list.length : insertAt;
  return [...list.slice(0, index), activity, ...list.slice(index)];
}

/** Inlocuieste activitatea cu acelasi id (de ex. dupa ce serverul confirma o creare/editare optimista). */
export function replaceActivity(list: readonly Activity[], activity: Activity): Activity[] {
  return list.map((item) => (item.id === activity.id ? activity : item));
}

/** Scoate activitatea cu id-ul dat din lista. */
export function removeActivity(list: readonly Activity[], id: number): Activity[] {
  return list.filter((item) => item.id !== id);
}
