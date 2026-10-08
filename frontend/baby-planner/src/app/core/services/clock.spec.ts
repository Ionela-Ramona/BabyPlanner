import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { Clock } from './clock';

describe('Clock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 25, 23, 58, 45));
  });

  afterEach(() => vi.useRealTimers());

  it('starts at the current time, with today at local midnight', () => {
    const clock = TestBed.inject(Clock);

    expect(clock.now()).toEqual(new Date(2026, 8, 25, 23, 58, 45));
    expect(clock.today()).toEqual(new Date(2026, 8, 25));
  });

  it('ticks at the start of the next minute, then every minute', () => {
    const clock = TestBed.inject(Clock);

    vi.advanceTimersByTime(14_999);
    expect(clock.now().getMinutes()).toBe(58);

    vi.advanceTimersByTime(1);
    expect(clock.now()).toEqual(new Date(2026, 8, 25, 23, 59, 0));

    vi.advanceTimersByTime(60_000);
    expect(clock.now()).toEqual(new Date(2026, 8, 26, 0, 0, 0));
    expect(clock.today()).toEqual(new Date(2026, 8, 26));
  });
});
