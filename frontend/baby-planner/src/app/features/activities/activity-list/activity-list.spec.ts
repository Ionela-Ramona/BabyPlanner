import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { Activity } from '../../../core/models/activity';
import { Baby } from '../../../core/models/baby';
import { QuickLogLauncher } from '../../../core/services/quick-log-launcher';
import { provideFakeClock } from '../../../core/testing/fake-clock';
import { ActivityList } from './activity-list';

const MARIA: Baby = { id: 1, name: 'Maria', dateOfBirth: '2026-03-01' };

/** "Acum" fixat pentru teste: joi, 25 septembrie 2026, 10:00 ora locala. */
const NOW = new Date(2026, 8, 25, 10, 0);

function activity(
  id: number,
  type: Activity['type'],
  occurredAt: Date,
  notes: string | null = null,
): Activity {
  return { id, babyId: 1, type, occurredAt: occurredAt.toISOString(), notes };
}

describe('ActivityList', () => {
  let httpMock: HttpTestingController;
  let editSpy: ReturnType<typeof vi.fn>;
  let openSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    try {
      localStorage.clear();
    } catch {
      // simetrie cu codul de productie, vezi ActiveBaby
    }

    editSpy = vi.fn();
    openSpy = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter(
          [{ path: 'babies/:babyId/activities', component: ActivityList }],
          withComponentInputBinding(),
        ),
        provideFakeClock(NOW).provider,
        { provide: QuickLogLauncher, useValue: { open: openSpy, openDetails: vi.fn(), edit: editSpy } },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  async function settle(): Promise<void> {
    await TestBed.inject(ApplicationRef).whenStable();
  }

  /** Navigheaza, raspunde la /api/babies (ActiveBaby) si asteapta stabilizarea. */
  async function navigate(url: string): Promise<RouterTestingHarness> {
    const harness = await RouterTestingHarness.create(url);
    TestBed.tick();
    httpMock.expectOne('/api/babies').flush([MARIA]);
    await settle();
    return harness;
  }

  function flushActivities(harness: RouterTestingHarness, list: Activity[], expectedType?: string) {
    TestBed.tick();
    const requests = httpMock.match((request) => request.url === '/api/babies/1/activities');
    expect(requests.length).toBe(1);
    const request = requests[0];
    if (expectedType === undefined) {
      expect(request.request.params.has('type')).toBe(false);
    } else {
      expect(request.request.params.get('type')).toBe(expectedType);
    }
    request.flush(list);
    return settle();
  }

  it('renders the single h1 "Istoric" even while loading', async () => {
    const harness = await RouterTestingHarness.create('/babies/1/activities');
    TestBed.tick();
    const h1s = harness.routeNativeElement!.querySelectorAll('h1');

    expect(h1s.length).toBe(1);
    expect(h1s[0].textContent).toContain('Istoric');

    httpMock.match(() => true).forEach((request) => request.flush([]));
  });

  it('shows the baby name once ActiveBaby resolves it', async () => {
    const harness = await navigate('/babies/1/activities');
    await flushActivities(harness, []);

    expect(harness.routeNativeElement!.textContent).toContain('Maria');
  });

  it('deep links with ?type=Feeding: sends the filter to the API', async () => {
    const harness = await navigate('/babies/1/activities?type=Feeding');
    await flushActivities(harness, [activity(1, 'Feeding', NOW)], 'Feeding');

    const root = harness.routeNativeElement!;
    const selected = root.querySelector('[role="option"][aria-selected="true"]');
    expect(selected?.textContent).toContain('Masă');
  });

  it('ignores an unknown ?type=xyz and loads the whole history', async () => {
    const harness = await navigate('/babies/1/activities?type=xyz');
    await flushActivities(harness, [activity(1, 'Feeding', NOW)], undefined);

    const root = harness.routeNativeElement!;
    const selected = root.querySelector('[role="option"][aria-selected="true"]');
    expect(selected?.textContent).toContain('Toate');
  });

  it('restores the previous filter on Back', async () => {
    const harness = await navigate('/babies/1/activities?type=Feeding');
    await flushActivities(harness, [], 'Feeding');

    const router = TestBed.inject((await import('@angular/router')).Router);
    await router.navigate([], { queryParams: { type: null } });
    TestBed.tick();
    httpMock.expectOne((r) => r.url === '/api/babies/1/activities').flush([]);
    await settle();

    let root = harness.routeNativeElement!;
    expect(root.querySelector('[role="option"][aria-selected="true"]')?.textContent).toContain('Toate');

    TestBed.inject(Location).back();
    TestBed.tick();
    await settle();
    httpMock.expectOne((r) => r.url === '/api/babies/1/activities').flush([]);
    await settle();

    root = harness.routeNativeElement!;
    expect(root.querySelector('[role="option"][aria-selected="true"]')?.textContent).toContain('Masă');
  });

  it('groups activities by local day, newest day first, with h2 headings and a summary', async () => {
    const today = new Date(2026, 8, 25, 8, 0);
    const yesterday = new Date(2026, 8, 24, 20, 0);

    const harness = await navigate('/babies/1/activities');
    await flushActivities(harness, [
      activity(1, 'Feeding', today),
      activity(2, 'Feeding', today),
      activity(3, 'Sleep', today),
      activity(4, 'Diaper', yesterday),
    ]);

    const root = harness.routeNativeElement!;
    const headings = Array.from(root.querySelectorAll('h2.day__heading'));
    expect(headings.map((h) => h.textContent?.trim())).toEqual(['Azi', 'Ieri']);

    const summaries = Array.from(root.querySelectorAll('.day__summary'));
    expect(summaries[0].textContent).toContain('2 mese');
    expect(summaries[0].textContent).toContain('1 somn');
    expect(summaries[1].textContent).toContain('1 scutec');
  });

  it('shows the empty state with a call to action when there are no activities at all', async () => {
    const harness = await navigate('/babies/1/activities');
    await flushActivities(harness, []);

    const root = harness.routeNativeElement!;
    const cta = Array.from(root.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Adaugă prima activitate'),
    );
    expect(cta).toBeTruthy();

    cta!.click();
    expect(openSpy).toHaveBeenCalled();
  });

  it('shows a type-specific empty state with "Arată toate" when the filter has no matches', async () => {
    const harness = await navigate('/babies/1/activities?type=Sleep');
    await flushActivities(harness, [], 'Sleep');

    const root = harness.routeNativeElement!;
    expect(root.textContent).toContain('Niciun somn înregistrat');

    const showAll = Array.from(root.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Arată toate'),
    );
    showAll!.click();
    TestBed.tick();
    httpMock.expectOne((r) => r.url === '/api/babies/1/activities').flush([]);
    await settle();

    expect(root.querySelector('[role="option"][aria-selected="true"]')?.textContent).toContain('Toate');
  });

  it('calls QuickLogLauncher.edit when a row is activated', async () => {
    const one = activity(1, 'Feeding', NOW, '120 ml');
    const harness = await navigate('/babies/1/activities');
    await flushActivities(harness, [one]);

    const root = harness.routeNativeElement!;
    const button = root.querySelector<HTMLButtonElement>('.activity-row__button');
    button!.click();

    expect(editSpy).toHaveBeenCalledWith(one);
  });
});
