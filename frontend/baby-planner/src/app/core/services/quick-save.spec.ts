import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { Activity, CreateActivityRequest } from '../models/activity';
import { provideFakeClock } from '../testing/fake-clock';
import { ToastOptions, ToastService } from '../../shared/overlays/toast.service';
import { ActivityLog } from './activity-log';
import { QuickLogLauncher } from './quick-log-launcher';
import { QuickSave, SAVE_FAILED, UNDO_FAILED } from './quick-save';

const NOW = new Date(2026, 8, 25, 10, 0);

describe('QuickSave', () => {
  let toasts: ToastOptions[];
  let create: ReturnType<typeof vi.fn<(babyId: number, request: CreateActivityRequest) => Observable<Activity>>>;
  let remove: ReturnType<typeof vi.fn<(babyId: number, activity: Activity) => Observable<void>>>;
  let edit: ReturnType<typeof vi.fn>;

  /** Ce intoarce "serverul": cererea primita, cu un id. */
  const saved = (request: CreateActivityRequest): Activity => ({ id: 7, babyId: 1, ...request });

  beforeEach(() => {
    toasts = [];
    create = vi.fn((_babyId, request) => of(saved(request)));
    remove = vi.fn(() => of(undefined));
    edit = vi.fn().mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      providers: [
        provideFakeClock(NOW).provider,
        { provide: ActivityLog, useValue: { create, remove } },
        { provide: QuickLogLauncher, useValue: { edit } },
        { provide: ToastService, useValue: { show: (options: ToastOptions) => (toasts.push(options), { dismiss: () => undefined }) } },
      ],
    });
  });

  const quickSave = () => TestBed.inject(QuickSave);

  it('saves the type "now", without notes, and confirms it', () => {
    quickSave().save(1, 'Feeding');

    expect(create).toHaveBeenCalledWith(1, { type: 'Feeding', occurredAt: NOW.toISOString(), notes: null });
    expect(toasts).toEqual([expect.objectContaining({ message: 'Masă înregistrată', tone: 'success' })]);
  });

  it('starts a sleep in progress', () => {
    quickSave().save(1, 'Sleep');

    expect(create.mock.calls[0][1]).toEqual(expect.objectContaining({ type: 'Sleep', inProgress: true }));
    expect(toasts[0].message).toBe('Somn început');
  });

  it('undoes the save from the toast', () => {
    quickSave().save(1, 'Diaper');
    toasts[0].action!.run();

    expect(remove).toHaveBeenCalledWith(1, expect.objectContaining({ id: 7, type: 'Diaper' }));
    expect(toasts[1]).toEqual(expect.objectContaining({ message: 'Am anulat.', tone: 'info' }));
  });

  it('says so when the undo fails', () => {
    remove.mockReturnValue(throwError(() => new Error('offline')));
    quickSave().save(1, 'Diaper');
    toasts[0].action!.run();

    expect(toasts[1]).toEqual(expect.objectContaining({ message: UNDO_FAILED, tone: 'danger' }));
  });

  it('opens the saved activity for details from the toast', () => {
    quickSave().save(1, 'Feeding');
    toasts[0].secondaryAction!.run();

    expect(edit).toHaveBeenCalledWith(expect.objectContaining({ id: 7 }));
  });

  it('on failure, retries with the original moment, not the retry time', () => {
    create.mockReturnValueOnce(throwError(() => new Error('offline')));
    quickSave().save(1, 'Feeding');

    expect(toasts[0]).toEqual(expect.objectContaining({ message: SAVE_FAILED, tone: 'danger' }));

    toasts[0].action!.run();
    expect(create).toHaveBeenCalledTimes(2);
    expect(create.mock.calls[1]).toEqual(create.mock.calls[0]);
    expect(toasts[1].message).toBe('Masă înregistrată');
  });
});
