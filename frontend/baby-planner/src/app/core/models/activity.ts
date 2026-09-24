import { ActivityType } from './activity-type';

/** Activitatea asa cum o intoarce API-ul (ActivityDto). */
export interface Activity {
  readonly id: number;
  readonly babyId: number;
  readonly type: ActivityType;

  /**
   * Momentul activitatii, ISO 8601.
   * Backendul salveaza ticks UTC, deci valoarea vine mereu cu offset zero
   * ("2026-09-24T12:31:48.5635505+00:00"). Conversia in ora locala se face la
   * afisare, nu aici.
   */
  readonly occurredAt: string;

  readonly notes: string | null;
}

/**
 * Corpul cererii de creare (CreateActivityRequest).
 * `babyId` nu apare: vine din ruta /api/babies/{babyId}/activities.
 */
export interface CreateActivityRequest {
  readonly type: ActivityType;
  readonly occurredAt: string;
  readonly notes: string | null;
}

/** Identic cu cererea de creare azi; vezi nota din UpdateBabyRequest. */
export type UpdateActivityRequest = CreateActivityRequest;
