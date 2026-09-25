import { Service, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { Activity, CreateActivityRequest, UpdateActivityRequest } from '../models/activity';
import { ActivityApi } from './activity-api';
import { ActivityChanges } from './activity-changes';

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

  /** Undo dupa o stergere: re-posteaza tipul/momentul/notele — activitatea reaparuta primeste un id nou. */
  restore(activity: Activity): Observable<Activity> {
    const request: CreateActivityRequest = {
      type: activity.type,
      occurredAt: activity.occurredAt,
      notes: activity.notes,
    };
    return this.activityApi.create(activity.babyId, request).pipe(tap(() => this.changes.notify()));
  }
}
