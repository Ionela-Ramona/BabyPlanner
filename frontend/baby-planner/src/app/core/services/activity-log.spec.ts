import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Activity } from '../models/activity';
import { ActivityChanges } from './activity-changes';
import { ActivityLog } from './activity-log';

const activity: Activity = {
  id: 9,
  babyId: 1,
  type: 'Sleep',
  occurredAt: '2026-09-25T11:00:00Z',
  notes: 'a dormit bine',
};

describe('ActivityLog', () => {
  let log: ActivityLog;
  let changes: ActivityChanges;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    log = TestBed.inject(ActivityLog);
    changes = TestBed.inject(ActivityChanges);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('notifies ActivityChanges after a successful create', () => {
    log.create(1, { type: 'Feeding', occurredAt: '2026-09-25T10:00:00Z', notes: null }).subscribe();

    httpMock
      .expectOne('/api/babies/1/activities')
      .flush({ id: 10, babyId: 1, type: 'Feeding', occurredAt: '2026-09-25T10:00:00Z', notes: null });

    expect(changes.version()).toBe(1);
  });

  it('notifies ActivityChanges after a successful update', () => {
    log.update(1, 9, { type: 'Sleep', occurredAt: '2026-09-25T11:30:00Z', notes: null }).subscribe();

    httpMock
      .expectOne('/api/babies/1/activities/9')
      .flush({ id: 9, babyId: 1, type: 'Sleep', occurredAt: '2026-09-25T11:30:00Z', notes: null });

    expect(changes.version()).toBe(1);
  });

  it('notifies ActivityChanges after a successful remove', () => {
    log.remove(1, activity).subscribe();

    httpMock.expectOne('/api/babies/1/activities/9').flush(null);

    expect(changes.version()).toBe(1);
  });

  it('does not notify when the request fails', () => {
    log.create(1, { type: 'Feeding', occurredAt: '2026-09-25T10:00:00Z', notes: null }).subscribe({
      error: () => {
        // Asteptat: doar verificam ca esecul nu declanseaza notify().
      },
    });

    httpMock
      .expectOne('/api/babies/1/activities')
      .flush('boom', { status: 500, statusText: 'Server Error' });

    expect(changes.version()).toBe(0);
  });

  it('restores a deleted activity by re-posting its type, moment and notes', () => {
    log.restore(activity).subscribe();

    const request = httpMock.expectOne('/api/babies/1/activities');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      type: 'Sleep',
      occurredAt: '2026-09-25T11:00:00Z',
      notes: 'a dormit bine',
    });

    request.flush({ ...activity, id: 11 });

    expect(changes.version()).toBe(1);
  });
});
