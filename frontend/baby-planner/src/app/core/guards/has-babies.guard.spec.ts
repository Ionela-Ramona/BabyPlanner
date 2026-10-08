import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';

import { ActiveBaby } from '../services/active-baby';
import { hasBabiesGuard } from './has-babies.guard';

describe('hasBabiesGuard', () => {
  const error = signal<unknown>(undefined);
  const isLoading = signal(false);
  const hasBabies = signal<boolean | undefined>(undefined);

  beforeEach(() => {
    error.set(undefined);
    isLoading.set(false);
    hasBabies.set(undefined);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: ActiveBaby, useValue: { error, isLoading, hasBabies } }],
    });
  });

  /** Ruleaza garda si colecteaza prima decizie, cand apare. */
  function run(): { decision: () => boolean | UrlTree | undefined } {
    let decision: boolean | UrlTree | undefined;
    const result = TestBed.runInInjectionContext(() =>
      hasBabiesGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    ) as Observable<boolean | UrlTree>;
    result.subscribe((value) => (decision = value));
    return {
      decision: () => {
        TestBed.tick();
        return decision;
      },
    };
  }

  it('lets the dashboard open when there are babies', async () => {
    hasBabies.set(true);
    const result = TestBed.runInInjectionContext(() =>
      hasBabiesGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    ) as Observable<boolean | UrlTree>;

    expect(await firstValueFrom(result)).toBe(true);
  });

  it('sends to /welcome when the list is empty', () => {
    hasBabies.set(false);

    const decision = run().decision();

    expect(decision instanceof UrlTree).toBe(true);
    expect(TestBed.inject(Router).serializeUrl(decision as UrlTree)).toBe('/welcome');
  });

  it('waits for the list instead of deciding while it loads', () => {
    isLoading.set(true);
    const guard = run();
    expect(guard.decision()).toBeUndefined();

    isLoading.set(false);
    hasBabies.set(true);
    expect(guard.decision()).toBe(true);
  });

  it('waits out a reload, even when the old list was empty', () => {
    hasBabies.set(false);
    isLoading.set(true);
    const guard = run();
    expect(guard.decision()).toBeUndefined();

    hasBabies.set(true);
    isLoading.set(false);
    expect(guard.decision()).toBe(true);
  });

  it('lets the page open on error, so it can show "Reîncearcă"', () => {
    error.set(new Error('offline'));
    isLoading.set(true);

    expect(run().decision()).toBe(true);
  });
});
