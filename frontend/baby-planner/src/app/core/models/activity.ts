import { ActivityType } from './activity-type';

/** Ce a fost in scutec (DiaperKind din backend, serializat ca text). */
export const DIAPER_KINDS = ['Wet', 'Dirty', 'Both'] as const;
export type DiaperKind = (typeof DIAPER_KINDS)[number];

export const DIAPER_KIND_LABELS: Readonly<Record<DiaperKind, string>> = {
  Wet: 'Ud',
  Dirty: 'Murdar',
  Both: 'Ud și murdar',
};

/** Activitatea asa cum o intoarce API-ul (ActivityDto). */
export interface Activity {
  readonly id: number;
  readonly babyId: number;
  readonly type: ActivityType;

  /**
   * Momentul activitatii (inceputul, pentru somn), ISO 8601.
   * Backendul salveaza ticks UTC, deci valoarea vine mereu cu offset zero
   * ("2026-09-24T12:31:48.5635505+00:00"). Conversia in ora locala se face la
   * afisare, nu aici.
   */
  readonly occurredAt: string;

  readonly notes: string | null;

  /**
   * Detaliile structurate (BP-UI-20). Toate pot lipsi: activitatile vechi nu le au,
   * iar totalurile de pe Azi se calculeaza doar din ele — niciodata din notite.
   * `amountMl` doar la masa, `durationMinutes` la somn si masa, `diaperKind` la scutec.
   */
  readonly amountMl?: number | null;
  readonly durationMinutes?: number | null;
  readonly diaperKind?: DiaperKind | null;
  /** Somnul a inceput si inca dureaza ("Încă doarme"). */
  readonly inProgress?: boolean;
}

/**
 * Corpul cererii de creare (CreateActivityRequest).
 * `babyId` nu apare: vine din ruta /api/babies/{babyId}/activities.
 */
export interface CreateActivityRequest {
  readonly type: ActivityType;
  readonly occurredAt: string;
  readonly notes: string | null;
  readonly amountMl?: number | null;
  readonly durationMinutes?: number | null;
  readonly diaperKind?: DiaperKind | null;
  readonly inProgress?: boolean;
}

/** Identic cu cererea de creare; PUT inlocuieste tot, deci si detaliile. */
export type UpdateActivityRequest = CreateActivityRequest;

/** Cererea care reface exact o activitate (Undo, editari partiale ca "S-a trezit"). */
export function toRequest(activity: Activity): CreateActivityRequest {
  return {
    type: activity.type,
    occurredAt: activity.occurredAt,
    notes: activity.notes,
    amountMl: activity.amountMl ?? null,
    durationMinutes: activity.durationMinutes ?? null,
    diaperKind: activity.diaperKind ?? null,
    inProgress: activity.inProgress ?? false,
  };
}
