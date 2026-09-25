import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Baby, CreateBabyRequest, UpdateBabyRequest } from '../models/baby';

/**
 * Singurul loc care stie cum arata endpoint-urile pentru bebelusi.
 *
 * Componentele nu construiesc niciodata URL-uri si nu folosesc HttpClient direct —
 * asa, daca se schimba o ruta din API, se schimba un singur fisier.
 *
 * Metodele intorc Observable: nu declanseaza nicio cerere pana cand cineva nu se
 * aboneaza (direct sau prin `async` pipe / `toSignal`).
 */
@Service()
export class BabyApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/babies`;

  /** GET /api/babies — toti bebelusii, ordonati dupa nume de catre server. */
  getAll(): Observable<Baby[]> {
    return this.http.get<Baby[]>(this.baseUrl);
  }

  /** GET /api/babies/{id} */
  getById(id: number): Observable<Baby> {
    return this.http.get<Baby>(`${this.baseUrl}/${id}`);
  }

  /** POST /api/babies — raspunde 201 cu bebelusul creat. */
  create(request: CreateBabyRequest): Observable<Baby> {
    return this.http.post<Baby>(this.baseUrl, request);
  }

  /** PUT /api/babies/{id} */
  update(id: number, request: UpdateBabyRequest): Observable<Baby> {
    return this.http.put<Baby>(`${this.baseUrl}/${id}`, request);
  }

  /** DELETE /api/babies/{id} — raspunde 204, fara corp. */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
