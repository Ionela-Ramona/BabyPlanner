import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { Baby } from '../../../core/models/baby';
import { ActiveBaby } from '../../../core/services/active-baby';
import { expectNoAxeViolations } from '../../../core/testing/axe';
import { provideFakeClock } from '../../../core/testing/fake-clock';
import { ConfirmService } from '../../../shared/overlays/confirm.service';
import { ToastOptions, ToastService } from '../../../shared/overlays/toast.service';
import { BabyProfile } from './baby-profile';

const maria: Baby = { id: 1, name: 'Maria', dateOfBirth: '2026-03-24' };
const ion: Baby = { id: 2, name: 'Ion', dateOfBirth: '2025-12-01' };

describe('BabyProfile', () => {
  let fixture: ComponentFixture<BabyProfile>;
  let httpMock: HttpTestingController;
  let confirm: ReturnType<typeof vi.fn>;
  let toasts: ToastOptions[];
  let navigateByUrl: ReturnType<typeof vi.spyOn>;
  /** Ce raspunde "serverul" la GET /api/babies; testele il schimba dupa stergere. */
  let babies: Baby[];

  /** Raspunde la toate cererile GET in asteptare, pana nu mai apare niciuna noua. */
  async function serveGets(): Promise<void> {
    for (let round = 0; round < 10; round++) {
      TestBed.tick();
      const pending = httpMock.match((request) => request.method === 'GET');
      for (const request of pending) {
        const url = request.request.url;
        if (url === '/api/babies') request.flush(babies);
        else if (url === '/api/babies/1') request.flush(maria);
        else request.flush([]);
      }
      await new Promise((resolve) => setTimeout(resolve));
      if (pending.length === 0 && round > 2) return;
    }
  }

  beforeEach(async () => {
    babies = [maria, ion];
    toasts = [];
    confirm = vi.fn().mockResolvedValue(true);

    TestBed.configureTestingModule({
      imports: [BabyProfile],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideFakeClock(new Date(2026, 8, 25, 10, 0)).provider,
        { provide: ConfirmService, useValue: { confirm } },
        {
          provide: ToastService,
          useValue: { show: (options: ToastOptions) => (toasts.push(options), { dismiss: () => undefined }) },
        },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    fixture = TestBed.createComponent(BabyProfile);
    fixture.componentRef.setInput('babyId', '1');
    fixture.detectChanges();
    await serveGets();
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  const root = () => fixture.nativeElement as HTMLElement;
  const deleteButton = () =>
    Array.from(root().querySelectorAll<HTMLButtonElement>('button')).find((button) =>
      button.textContent?.includes('Șterge'),
    )!;

  it('puts the name in the heading as plain text and shows the age', () => {
    expect(root().querySelector('h1')?.textContent).toContain('Maria');
    expect(root().textContent).toContain('6 luni');
  });

  it('becomes the active baby', () => {
    expect(TestBed.inject(ActiveBaby).activeId()).toBe(1);
  });

  it('asks before deleting, and does nothing when the parent cancels', async () => {
    confirm.mockResolvedValue(false);
    deleteButton().click();
    await fixture.whenStable();

    expect(confirm).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('Ștergi bebelușul Maria și toate activitățile?') }),
    );
    httpMock.expectNone({ method: 'DELETE' });
  });

  it('after deleting the active baby, switches to another one and goes to Bebeluși', async () => {
    deleteButton().click();
    await new Promise((resolve) => setTimeout(resolve));

    httpMock.expectOne({ method: 'DELETE', url: '/api/babies/1' }).flush(null);
    babies = [ion];
    await serveGets();
    await fixture.whenStable();

    expect(TestBed.inject(ActiveBaby).activeId()).toBe(2);
    expect(toasts.at(-1)?.message).toBe('Bebelușul Maria a fost șters');
    expect(navigateByUrl).toHaveBeenCalledWith('/babies');
  });

  it('after deleting the last baby, goes to the welcome page', async () => {
    babies = [maria];
    TestBed.inject(ActiveBaby).reload();
    await serveGets();

    deleteButton().click();
    await new Promise((resolve) => setTimeout(resolve));
    httpMock.expectOne({ method: 'DELETE', url: '/api/babies/1' }).flush(null);
    babies = [];
    await serveGets();
    await fixture.whenStable();

    expect(navigateByUrl).toHaveBeenCalledWith('/welcome');
  });

  it('keeps the profile and shows an error toast when the delete fails', async () => {
    deleteButton().click();
    await new Promise((resolve) => setTimeout(resolve));
    httpMock
      .expectOne({ method: 'DELETE', url: '/api/babies/1' })
      .flush(null, { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(toasts.at(-1)?.tone).toBe('danger');
    expect(navigateByUrl).not.toHaveBeenCalled();
  });

  it('has no AXE violations', async () => {
    await expectNoAxeViolations(fixture);
  });
});
