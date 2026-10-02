import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Activity } from '../models/activity';
import { ActivityChanges } from './activity-changes';
import { ActivityLog, sleptMinutes } from './activity-log';
import { provideFakeClock } from '../testing/fake-clock';

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
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideFakeClock(new Date('2026-09-25T12:00:00Z')).provider,
      ],
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

  it('restores a deleted activity by re-posting everything, details included', () => {
    log.restore({ ...activity, durationMinutes: 45 }).subscribe();

    const request = httpMock.expectOne('/api/babies/1/activities');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      type: 'Sleep',
      occurredAt: '2026-09-25T11:00:00Z',
      notes: 'a dormit bine',
      amountMl: null,
      durationMinutes: 45,
      diaperKind: null,
      inProgress: false,
    });

    request.flush({ ...activity, id: 11 });

    expect(changes.version()).toBe(1);
  });

  it('wakes a sleep in progress with the minutes slept so far', () => {
    // Ceasul fals e la 12:00 UTC; somnul a inceput la 11:00.
    log.wake({ ...activity, notes: null, inProgress: true }).subscribe();

    const request = httpMock.expectOne({ method: 'PUT', url: '/api/babies/1/activities/9' });
    expect(request.request.body).toEqual(
      expect.objectContaining({ inProgress: false, durationMinutes: 60, occurredAt: '2026-09-25T11:00:00Z' }),
    );
    request.flush({ ...activity, inProgress: false, durationMinutes: 60 });
  });

  it('never sends a duration outside 1 minute to one day', () => {
    expect(sleptMinutes({ ...activity, occurredAt: '2026-09-25T12:00:00Z' }, new Date('2026-09-25T12:00:10Z'))).toBe(1);
    expect(sleptMinutes({ ...activity, occurredAt: '2026-09-20T12:00:00Z' }, new Date('2026-09-25T12:00:00Z'))).toBe(1440);
  });
});
