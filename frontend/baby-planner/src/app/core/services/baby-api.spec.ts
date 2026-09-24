import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { BabyApi } from './baby-api';

describe('BabyApi', () => {
  let api: BabyApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    api = TestBed.inject(BabyApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  // Verifica si ca nicio cerere neasteptata nu a ramas in urma.
  afterEach(() => httpMock.verify());

  it('should request the babies collection', () => {
    api.getAll().subscribe();

    const request = httpMock.expectOne('/api/babies');
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('should post the create request to the collection', () => {
    const body = { name: 'Maria', dateOfBirth: '2026-03-24' };

    api.create(body).subscribe();

    const request = httpMock.expectOne('/api/babies');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    request.flush({ id: 1, ...body });
  });

  it('should address a single baby by id', () => {
    api.delete(7).subscribe();

    const request = httpMock.expectOne('/api/babies/7');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
