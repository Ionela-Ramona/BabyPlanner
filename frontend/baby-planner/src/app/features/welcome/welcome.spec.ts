import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { ActiveBaby } from '../../core/services/active-baby';
import { expectNoAxeViolations } from '../../core/testing/axe';
import { provideFakeClock } from '../../core/testing/fake-clock';
import { ToastOptions, ToastService } from '../../shared/overlays/toast.service';
import { BabyForm } from '../babies/baby-form/baby-form';
import { Welcome } from './welcome';

describe('Welcome', () => {
  let toasts: ToastOptions[];
  let reload: ReturnType<typeof vi.fn>;
  let select: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    toasts = [];
    reload = vi.fn();
    select = vi.fn();
    TestBed.configureTestingModule({
      imports: [Welcome],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActiveBaby, useValue: { reload, select } },
        provideFakeClock(new Date(2026, 8, 25, 10, 0)).provider,
        { provide: ToastService, useValue: { show: (options: ToastOptions) => (toasts.push(options), { dismiss: () => undefined }) } },
      ],
    });
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('offers the baby form without "Anulează"', async () => {
    const fixture = TestBed.createComponent(Welcome);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('h1')?.textContent).toBe('Bun venit!');
    expect(root.querySelector('button[type="submit"]')?.textContent).toContain('Adaugă bebelușul');
    expect(Array.from(root.querySelectorAll('button')).some((button) => button.textContent?.includes('Anulează'))).toBe(
      false,
    );
    await expectNoAxeViolations(fixture);
  });

  it('after saving, makes the new baby active and goes to Azi', () => {
    const navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(Welcome);
    fixture.detectChanges();

    (fixture.debugElement.query(By.directive(BabyForm)).componentInstance as BabyForm).saved.emit({
      id: 3,
      name: 'Ana',
      dateOfBirth: '2026-09-01',
    });

    expect(toasts).toEqual([{ message: 'Salvat', tone: 'success' }]);
    expect(reload).toHaveBeenCalled();
    expect(select).toHaveBeenCalledWith(3);
    expect(navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });
});
