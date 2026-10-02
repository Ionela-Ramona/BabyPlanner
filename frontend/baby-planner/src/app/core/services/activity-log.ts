import { Service, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { Activity, CreateActivityRequest, UpdateActivityRequest, toRequest } from '../models/activity';
import { ActivityApi } from './activity-api';
import { ActivityChanges } from './activity-changes';
import { Clock } from './clock';

/** Aceeasi limita ca in backend (ActivityRules.MaxDurationMinutes): o zi. */
export const MAX_DURATION_MINUTES = 24 * 60;

/**
 * Fatada peste `ActivityApi` pentru mutatii (creare/editare/stergere/restaurare).
 *
 * E singurul loc care anunta `ActivityChanges` dupa succes — asa Azi si Istoric
 * se reincarca automat, iar componentele care fac mutatii nu trebuie sa stie
 * nimic despre reincarcare, doar sa cheme aceste metode.
 */
@Service()
export class ActivityLog {
  private readonly activityApi = inject(ActivityApi);
  private readonly changes = inject(ActivityChanges);
  private readonly clock = inject(Clock);

  create(babyId: number, request: CreateActivityRequest): Observable<Activity> {
    return this.activityApi.create(babyId, request).pipe(tap(() => this.changes.notify()));
  }

  update(babyId: number, id: number, request: UpdateActivityRequest): Observable<Activity> {
    return this.activityApi.update(babyId, id, request).pipe(tap(() => this.changes.notify()));
  }

  /** Primeste activitatea intreaga (nu doar id-ul), ca `restore` sa aiba ce reface la Undo. */
  remove(babyId: number, activity: Activity): Observable<void> {
    return this.activityApi.delete(babyId, activity.id).pipe(tap(() => this.changes.notify()));
  }

  /** Undo dupa o stergere: re-posteaza tot (si detaliile) — activitatea reaparuta primeste un id nou. */
  restore(activity: Activity): Observable<Activity> {
    return this.activityApi.create(activity.babyId, toRequest(activity)).pipe(tap(() => this.changes.notify()));
  }

  /**
   * "S-a trezit": incheie un somn in desfasurare. Durata e cat a trecut de la
   * inceput pana acum, rotunjita la minut, intre 1 minut si o zi (limitele API-ului).
   */
  wake(activity: Activity): Observable<Activity> {
    return this.update(activity.babyId, activity.id, {
      ...toRequest(activity),
      inProgress: false,
      durationMinutes: sleptMinutes(activity, this.clock.now()),
    });
  }
}

/** Minutele de la inceputul activitatii pana la `now`, intre 1 si o zi. */
export function sleptMinutes(activity: Activity, now: Date): number {
  const minutes = Math.round((now.getTime() - Date.parse(activity.occurredAt)) / 60_000);
  return Math.min(MAX_DURATION_MINUTES, Math.max(1, minutes));
}
