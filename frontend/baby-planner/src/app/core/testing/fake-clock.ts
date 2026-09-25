import { Provider, WritableSignal, signal } from '@angular/core';

import { Clock } from '../services/clock';

/** Rezultatul lui `provideFakeClock`: providerul pentru TestBed, plus un `set` pentru a avansa timpul manual. */
export interface FakeClock {
  readonly provider: Provider;
  set(date: Date): void;
}

/**
 * Inlocuieste `Clock` in teste cu un ceas controlat manual, ca timpul sa nu
 * treaca singur intre doua assert-uri.
 *
 * Folosire: `TestBed.configureTestingModule({ providers: [provideFakeClock(new Date(...)).provider] })`,
 * apoi `fakeClock.set(newDate)` cand testul vrea sa simuleze trecerea timpului.
 */
export function provideFakeClock(initial: Date): FakeClock {
  const nowState: WritableSignal<Date> = signal(initial);
  const todayState: WritableSignal<Date> = signal(toMidnight(initial));

  // Structura trebuie sa se potriveasca cu Clock (now/today), dar Clock are un
  // camp privat, deci obiectul simplu nu se potriveste structural — de aici cast-ul.
  const fake = {
    now: nowState.asReadonly(),
    today: todayState.asReadonly(),
  } as unknown as Clock;

  return {
    provider: { provide: Clock, useValue: fake },
    set: (date: Date) => {
      nowState.set(date);
      todayState.set(toMidnight(date));
    },
  };
}

function toMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
