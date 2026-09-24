import { HttpClient, HttpParams } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  Activity,
  CreateActivityRequest,
  UpdateActivityRequest,
} from '../models/activity';
import { ActivityType } from '../models/activity-type';

/**
 * Endpoint-urile pentru activitatile unui bebelus.
 *
 * Toate rutele sunt imbricate sub /api/babies/{babyId}/activities, deci fiecare
 * metoda primeste `babyId` — la fel ca in backend, o activitate nu exista in
 * afara unui bebelus.
 */
@Service()
export class ActivityApi {
  private readonly http = inject(HttpClient);

  /** GET .../activities — optional filtrate dupa tip. */
  getForBaby(babyId: number, type?: ActivityType): Observable<Activity[]> {
    return this.http.get<Activity[]>(this.activitiesUrl(babyId), {
      params: this.typeParams(type),
    });
  }

  /** GET .../activities/today — sursa de date pentru dashboard. */
  getToday(babyId: number, type?: ActivityType): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.activitiesUrl(babyId)}/today`, {
      params: this.typeParams(type),
    });
  }

  /** GET .../activities/{id} */
  getById(babyId: number, id: number): Observable<Activity> {
    return this.http.get<Activity>(`${this.activitiesUrl(babyId)}/${id}`);
  }

  /** POST .../activities */
  create(babyId: number, request: CreateActivityRequest): Observable<Activity> {
    return this.http.post<Activity>(this.activitiesUrl(babyId), request);
  }

  /** PUT .../activities/{id} */
  update(babyId: number, id: number, request: UpdateActivityRequest): Observable<Activity> {
    return this.http.put<Activity>(`${this.activitiesUrl(babyId)}/${id}`, request);
  }

  /** DELETE .../activities/{id} */
  delete(babyId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.activitiesUrl(babyId)}/${id}`);
  }

  private activitiesUrl(babyId: number): string {
    return `${environment.apiBaseUrl}/babies/${babyId}/activities`;
  }

  /** Fara filtru nu trimitem deloc parametrul, ca sa nu ajunga "?type=" gol la server. */
  private typeParams(type?: ActivityType): HttpParams {
    return type ? new HttpParams().set('type', type) : new HttpParams();
  }
}
