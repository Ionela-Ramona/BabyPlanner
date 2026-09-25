import { LiveAnnouncer } from '@angular/cdk/a11y';
import { TestBed } from '@angular/core/testing';

import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;
  let announce: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    announce = vi.fn().mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      providers: [{ provide: LiveAnnouncer, useValue: { announce } }],
    });
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a toast and announces it politely', () => {
    service.show({ message: 'Masă înregistrată' });

    expect(service.current()?.message).toBe('Masă înregistrată');
    expect(announce).toHaveBeenCalledWith('Masă înregistrată', 'polite');
  });

  it('keeps only one toast visible and queues the rest', () => {
    service.show({ message: 'Primul' });
    service.show({ message: 'Al doilea' });

    expect(service.current()?.message).toBe('Primul');
    expect(service.queue().length).toBe(2);

    vi.advanceTimersByTime(5000);

    expect(service.current()?.message).toBe('Al doilea');
    expect(announce).toHaveBeenCalledWith('Al doilea', 'polite');
  });

  it('auto-dismisses after the given duration', () => {
    service.show({ message: 'Se închide singur', duration: 1000 });

    vi.advanceTimersByTime(999);
    expect(service.current()).not.toBeNull();

    vi.advanceTimersByTime(1);
    expect(service.current()).toBeNull();
  });

  it('pauses the timer on hover/focus and resumes with the remaining time', () => {
    service.show({ message: 'Pauza pe hover', duration: 1000 });

    vi.advanceTimersByTime(800);
    service.pause();
    vi.advanceTimersByTime(5000);
    expect(service.current()).not.toBeNull();

    service.resume();
    vi.advanceTimersByTime(199);
    expect(service.current()).not.toBeNull();

    vi.advanceTimersByTime(1);
    expect(service.current()).toBeNull();
  });

  it('runs the action and dismisses the toast', () => {
    const run = vi.fn();
    service.show({ message: 'Cu acțiune', action: { label: 'Anulează', run } });

    const handle = service.current();
    handle?.action?.run();
    service.dismiss(handle!.id);

    expect(run).toHaveBeenCalled();
    expect(service.current()).toBeNull();
  });

  it('lets a handle dismiss its own toast early', () => {
    const handle = service.show({ message: 'Închide manual' });

    handle.dismiss();

    expect(service.current()).toBeNull();
  });
});
