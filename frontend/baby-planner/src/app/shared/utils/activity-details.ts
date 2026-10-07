import { Activity, DIAPER_KIND_LABELS } from '../../core/models/activity';

/**
 * Textele scurte pentru detaliile structurate (BP-UI-20). Se citesc doar din
 * campurile API-ului; notitele raman text liber si nu sunt niciodata "parsate".
 */

/** "45 min", "1 h", "9 h 40 min". */
export function durationLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) {
    return `${rest} min`;
  }
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

/** "120 ml · 15 min", "45 min", "Ud", "încă doarme" — sau gol, fara detalii. */
export function detailsLabel(activity: Activity): string {
  if (activity.inProgress) {
    return 'încă doarme';
  }
  const parts: string[] = [];
  if (activity.amountMl) {
    parts.push(`${activity.amountMl} ml`);
  }
  if (activity.durationMinutes) {
    parts.push(durationLabel(activity.durationMinutes));
  }
  if (activity.diaperKind) {
    parts.push(DIAPER_KIND_LABELS[activity.diaperKind]);
  }
  return parts.join(' · ');
}
