import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ActivityApi } from './activity-api';

describe('ActivityApi', () => {
  let api: ActivityApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    api = TestBed.inject(ActivityApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should nest activities under their baby', () => {
    api.getForBaby(7).subscribe();

    const request = httpMock.expectOne('/api/babies/7/activities');
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('should send the type filter as a query parameter', () => {
    api.getForBaby(7, 'Feeding').subscribe();

    const request = httpMock.expectOne('/api/babies/7/activities?type=Feeding');
    expect(request.request.params.get('type')).toBe('Feeding');
    request.flush([]);
  });

  it('should omit the type parameter when no filter is given', () => {
    api.getToday(7).subscribe();

    // Fara filtru URL-ul ramane curat, fara "?type=" gol.
    const request = httpMock.expectOne('/api/babies/7/activities/today');
    expect(request.request.params.has('type')).toBe(false);
    request.flush([]);
  });
});
