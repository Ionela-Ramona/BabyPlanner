import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { Activity } from '../../../core/models/activity';
import { Baby } from '../../../core/models/baby';
import { ActivityChanges } from '../../../core/services/activity-changes';
import { QuickLogLauncher } from '../../../core/services/quick-log-launcher';
import { FakeClock, provideFakeClock } from '../../../core/testing/fake-clock';
import { nextRequest } from '../../../core/testing/next-request';
import { DashboardPage } from './dashboard-page';

const NOW = new Date(2026, 8, 25, 20, 30);
const at = (hour: number, minute = 0) => new Date(2026, 8, 25, hour, minute).toISOString();

const maria: Baby = { id: 1, name: 'Maria', dateOfBirth: '2026-03-25' };

const TODAY: Activity[] = [
  { id: 1, babyId: 1, type: 'Feeding', occurredAt: at(3, 10), notes: '90 ml lapte praf' },
  { id: 2, babyId: 1, type: 'Diaper', occurredAt: at(7, 45), notes: null },
  { id: 3, babyId: 1, type: 'Feeding', occurredAt: at(9), notes: '120 ml' },
  { id: 4, babyId: 1, type: 'Sleep', occurredAt: at(13, 20), notes: 'a dormit bine' },
  { id: 5, babyId: 1, type: 'Feeding', occurredAt: at(15, 30), notes: null },
  { id: 6, babyId: 1, type: 'Medicine', occurredAt: at(19), notes: 'Vitamina D' },
];

const TODAY_URL = '/api/babies/1/activities/today';
const ONGOING_URL = '/api/babies/1/activities/ongoing';
const LATEST_URL = '/api/babies/1/activities/latest';

describe('DashboardPage', () => {
  let httpMock: HttpTestingController;
  /** Ce raspunde /ongoing; gol, in afara testelor despre somnul in desfasurare. */
  let ongoing: Activity[] = [];
  /** Ce raspunde /latest; gol, in afara testelor despre ziua de ieri. */
  let latest: Activity[] = [];
  let harness: RouterTestingHarness;
  let clock: FakeClock;
  let launcher: { open: ReturnType<typeof vi.fn>; edit: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    ongoing = [];
    latest = [];
    localStorage.clear();
    clock = provideFakeClock(NOW);
    launcher = { open: vi.fn(), edit: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'dashboard', component: DashboardPage }], withComponentInputBinding()),
        clock.provider,
        { provide: QuickLogLauncher, useValue: launcher },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  /**
   * Raspunde si la /ongoing si /latest (ce trece de granita zilei), cerute alaturi de
   * /today si dupa fiecare schimbare. Fara raspuns, `whenStable` le-ar astepta la nesfarsit.
   */
  async function settle(): Promise<void> {
    TestBed.tick();
    for (const request of httpMock.match(ONGOING_URL)) {
      request.flush(ongoing);
    }
    for (const request of httpMock.match(LATEST_URL)) {
      request.flush(latest);
    }
    await harness.fixture.whenStable();
    harness.detectChanges();
  }

  function root(): HTMLElement {
    return harness.routeNativeElement as HTMLElement;
  }

  /** Porneste pagina la `url` si raspunde la bebelusi si la activitatile de azi. */
  async function setup(
    url = '/dashboard',
    today: Activity[] | 'error' = TODAY,
    babies: Baby[] = [maria],
  ): Promise<void> {
    harness = await RouterTestingHarness.create(url);
    TestBed.tick();
    httpMock.expectOne('/api/babies').flush(babies);
    if (babies.length === 0) {
      await settle();
      return;
    }
    const request = await nextRequest(httpMock, TODAY_URL);
    if (today === 'error') {
      request.flush('boom', { status: 500, statusText: 'Server Error' });
    } else {
      request.flush(today);
    }
    await settle();
  }

  function tile(label: string): HTMLButtonElement {
    const button = Array.from(root().querySelectorAll<HTMLButtonElement>('app-summary-tile button')).find(
      (candidate) => candidate.getAttribute('aria-label')?.startsWith(`${label}:`),
    );
    if (!button) {
      throw new Error(`No tile for ${label}`);
    }
    return button;
  }

  function tileLabels(): string[] {
    return Array.from(root().querySelectorAll('app-summary-tile button')).map(
      (button) => button.getAttribute('aria-label')!.split(':')[0],
    );
  }

  function rowNames(): string[] {
    return Array.from(root().querySelectorAll('app-activity-row button')).map(
      (button) => button.getAttribute('aria-label')!,
    );
  }

  function buttonByText(text: string): HTMLButtonElement {
    const button = Array.from(root().querySelectorAll<HTMLButtonElement>('button')).find((candidate) =>
      candidate.textContent?.includes(text),
    );
    if (!button) {
      throw new Error(`No button "${text}"`);
    }
    return button;
  }

  function url(): string {
    return TestBed.inject(Router).url;
  }

  it('renders exactly one h1 on first render, then the baby name in the accent script', async () => {
    harness = await RouterTestingHarness.create('/dashboard');

    expect(root().querySelectorAll('h1').length).toBe(1);

    TestBed.tick();
    httpMock.expectOne('/api/babies').flush([maria]);
    (await nextRequest(httpMock, TODAY_URL)).flush(TODAY);
    await settle();

    const headings = root().querySelectorAll('h1');
    expect(headings.length).toBe(1);
    expect(headings[0].textContent?.trim()).toBe('Maria');
    expect(headings[0].querySelector('.script')).not.toBeNull();
    expect(root().textContent).toContain('6 luni');
    expect(root().querySelector('app-ribbon')?.textContent).toContain('Azi · vineri, 25 septembrie');
  });

  it('computes the tiles from the data: three core rows, then the rare types on one line', async () => {
    await setup();

    expect(tileLabels()).toEqual(['Masă', 'Somn', 'Scutec', 'Medicamente', 'Altele']);
    expect(root().querySelectorAll('.summary__tiles app-summary-tile').length).toBe(3);
    expect(root().querySelectorAll('.summary__rare app-summary-tile').length).toBe(2);
    expect(tile('Masă').getAttribute('aria-label')).toBe(
      'Masă: ultima acum 5 ore, la 15:30, 3 mese azi. Adaugă o masă',
    );
    expect(tile('Masă').textContent).toContain('acum 5 ore');
    expect(tile('Masă').textContent).toContain('15:30');
    expect(tile('Somn').textContent).toContain('1 somn');
    // Dala noteaza, nu filtreaza: nu e un buton de comutare.
    expect(tile('Masă').hasAttribute('aria-pressed')).toBe(false);
  });

  it('a tile tap saves that type "now" in one tap, without touching the filter', async () => {
    await setup();

    tile('Masă').click();
    const request = await nextRequest(httpMock, (r) => r.method === 'POST');
    expect(request.request.url).toBe('/api/babies/1/activities');
    expect(request.request.body).toEqual({ type: 'Feeding', occurredAt: NOW.toISOString(), notes: null });
    request.flush({ id: 20, babyId: 1, type: 'Feeding', occurredAt: NOW.toISOString(), notes: null });

    (await nextRequest(httpMock, TODAY_URL)).flush(TODAY);
    await settle();
    expect(url()).toBe('/dashboard');
    expect(launcher.open).not.toHaveBeenCalled();
  });

  it('an empty Somn tile starts a sleep in one tap', async () => {
    await setup('/dashboard', TODAY.filter((activity) => activity.type !== 'Sleep'));

    const sleep = tile('Somn');
    expect(sleep.textContent).toContain('Încă nimic azi');
    sleep.click();

    const request = await nextRequest(httpMock, (r) => r.method === 'POST');
    expect(request.request.body).toEqual(expect.objectContaining({ type: 'Sleep', inProgress: true }));
    request.flush({ id: 21, babyId: 1, type: 'Sleep', occurredAt: NOW.toISOString(), notes: null, inProgress: true });
    (await nextRequest(httpMock, TODAY_URL)).flush(TODAY);
    await settle();
  });

  it('Medicamente opens the form instead, since it needs a note', async () => {
    await setup();

    tile('Medicamente').click();

    expect(launcher.open).toHaveBeenCalledWith('Medicine');
    httpMock.expectNone((r) => r.method === 'POST');
  });

  it('filters from the chips and keeps the filter in the URL', async () => {
    await setup();

    const sleepChip = Array.from(root().querySelectorAll<HTMLElement>('[role="option"]')).find((chip) =>
      chip.textContent?.includes('Somn'),
    )!;
    sleepChip.dispatchEvent(new PointerEvent('click', { bubbles: true }));
    await settle();

    expect(url()).toBe('/dashboard?type=Sleep');
    expect(rowNames()).toEqual(['Somn la 13:20, a dormit bine. Editează']);
  });

  it('restores the filter from the URL and ignores unknown values', async () => {
    await setup('/dashboard?type=Diaper');
    expect(rowNames()).toEqual(['Scutec la 07:45. Editează']);
  });

  it('ignores an unknown ?type= value', async () => {
    await setup('/dashboard?type=Nope');

    expect(rowNames().length).toBe(TODAY.length);
    const all = root().querySelector('[role="option"]');
    expect(all?.getAttribute('aria-selected')).toBe('true');
  });

  it('groups the timeline by part of day, newest first', async () => {
    await setup();

    const labels = Array.from(root().querySelectorAll('app-divider')).map((divider) =>
      divider.textContent?.trim(),
    );
    expect(labels).toEqual(['Seara', 'După-amiaza', 'Dimineața', 'Noaptea']);

    const lists = Array.from(root().querySelectorAll('ul.timeline__list'));
    expect(lists.map((list) => list.getAttribute('aria-label'))).toEqual(labels);
    expect(lists[1].querySelectorAll('li').length).toBe(2);
    expect(rowNames()[0]).toBe('Medicamente la 19:00, Vitamina D. Editează');
  });

  it('opens edit when a row is tapped', async () => {
    await setup();

    (root().querySelector('app-activity-row button') as HTMLButtonElement).click();

    expect(launcher.edit).toHaveBeenCalledWith(TODAY[5]);
  });

  it('updates the relative labels when the clock advances, without refetching', async () => {
    await setup();
    expect(tile('Masă').textContent).toContain('acum 5 ore');

    clock.set(new Date(2026, 8, 25, 21, 30));
    await settle();

    expect(tile('Masă').textContent).toContain('acum 6 ore');
    httpMock.expectNone(TODAY_URL);
  });

  it('refetches after a change and keeps the old rows visible meanwhile', async () => {
    await setup();

    TestBed.inject(ActivityChanges).notify();
    const request = await nextRequest(httpMock, TODAY_URL);
    harness.detectChanges();
    expect(rowNames().length).toBe(TODAY.length);

    const added: Activity = { id: 7, babyId: 1, type: 'Diaper', occurredAt: at(20, 10), notes: null };
    request.flush([...TODAY, added]);
    await settle();

    expect(rowNames()[0]).toBe('Scutec la 20:10. Editează');
    expect(root().querySelector('li.timeline__item--new')?.textContent).toContain('20:10');
    expect(root().querySelectorAll('li.timeline__item--new').length).toBe(1);
  });

  it('shows the empty state with a real next action when nothing happened today', async () => {
    await setup('/dashboard', []);

    expect(root().querySelector('h3')?.textContent).toContain('Nicio activitate azi.');
    expect(tileLabels()).toEqual(['Masă', 'Somn', 'Scutec', 'Medicamente', 'Altele']);

    buttonByText('Adaugă prima activitate').click();

    expect(launcher.open).toHaveBeenCalledWith();
  });

  it('shows the filtered-empty state and clears the filter from it', async () => {
    await setup('/dashboard?type=Sleep', TODAY.filter((activity) => activity.type !== 'Sleep'));

    expect(root().querySelector('h3')?.textContent).toContain('Niciun somn azi');

    buttonByText('Arată toate').click();
    await settle();

    expect(url()).toBe('/dashboard');
    expect(rowNames().length).toBe(TODAY.length - 1);
  });

  it('shows the error state and retries the request', async () => {
    await setup('/dashboard', 'error');

    const alert = root().querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Nu am putut încărca ziua de azi');
    expect(root().querySelectorAll('h1').length).toBe(1);

    buttonByText('Reîncearcă').click();
    (await nextRequest(httpMock, TODAY_URL)).flush(TODAY);
    await settle();

    expect(root().querySelector('[role="alert"]')).toBeNull();
    expect(rowNames().length).toBe(TODAY.length);
  });

  it('shows totals on the tiles only from structured details', async () => {
    await setup('/dashboard', [
      { ...TODAY[0], amountMl: 90 },
      TODAY[1],
      { ...TODAY[2], amountMl: 120 },
      { ...TODAY[3], durationMinutes: 100 },
      TODAY[4],
      TODAY[5],
    ]);

    expect(tile('Masă').textContent).toContain('210 ml azi');
    expect(tile('Somn').textContent).toContain('1 h 40 min azi');
    // Scutecul n-are nimic masurat: niciun "0".
    expect(tile('Scutec').querySelector('.tile__total')).toBeNull();
    expect(tile('Masă').getAttribute('aria-label')).toContain('în total 210 ml azi');
  });

  it('shows a sleep still in progress, even one started yesterday, and ends it with "S-a trezit"', async () => {
    const sleep: Activity = {
      id: 9,
      babyId: 1,
      type: 'Sleep',
      // Aseara la 19:20: nu e in /today, dar /ongoing il aduce.
      occurredAt: new Date(2026, 8, 24, 19, 20).toISOString(),
      notes: null,
      inProgress: true,
    };
    ongoing = [sleep];
    await setup();

    const banner = root().querySelector('.sleeping');
    expect(banner?.textContent).toContain('Încă doarme');
    expect(banner?.textContent).toContain('de 24 h');
    expect(banner?.textContent).toContain('19:20');

    buttonByText('S-a trezit').click();
    const request = await nextRequest(httpMock, (r) => r.method === 'PUT');
    expect(request.request.url).toBe('/api/babies/1/activities/9');
    expect(request.request.body).toEqual(expect.objectContaining({ inProgress: false, durationMinutes: 1440 }));
    request.flush({ ...sleep, inProgress: false, durationMinutes: 1440 });

    ongoing = [];
    (await nextRequest(httpMock, TODAY_URL)).flush(TODAY);
    await settle();
    expect(root().querySelector('.sleeping')).toBeNull();
  });

  it('while the baby sleeps, the Somn tile says so and ends the sleep like "S-a trezit"', async () => {
    const sleep: Activity = {
      id: 9,
      babyId: 1,
      type: 'Sleep',
      occurredAt: at(19, 30),
      notes: null,
      inProgress: true,
    };
    ongoing = [sleep];
    await setup('/dashboard', [...TODAY, sleep]);

    const tileButton = tile('Somn');
    expect(tileButton.textContent).toContain('Doarme acum');
    expect(tileButton.getAttribute('aria-label')).toBe('Somn: doarme acum. Notează trezirea.');

    tileButton.click();
    const request = await nextRequest(httpMock, (r) => r.method === 'PUT');
    expect(request.request.url).toBe('/api/babies/1/activities/9');
    expect(request.request.body).toEqual(expect.objectContaining({ inProgress: false, durationMinutes: 60 }));
    request.flush({ ...sleep, inProgress: false, durationMinutes: 60 });

    ongoing = [];
    (await nextRequest(httpMock, TODAY_URL)).flush(TODAY);
    await settle();
  });

  it('after midnight, the tiles still show the last feed from last night', async () => {
    // 20:30 azi e "acum"; masa de aseara la 23:40 e ultima. Azi: doar un scutec.
    const lastNightFeed: Activity = {
      id: 7,
      babyId: 1,
      type: 'Feeding',
      occurredAt: new Date(2026, 8, 24, 23, 40).toISOString(),
      notes: null,
    };
    latest = [lastNightFeed, TODAY[1]];
    await setup('/dashboard', [TODAY[1]]);

    const feeding = tile('Masă');
    expect(feeding.textContent).toContain('ieri, 23:40');
    expect(feeding.textContent).toContain('încă nimic azi');
    expect(feeding.textContent).not.toContain('Încă nimic azi');
    expect(feeding.getAttribute('aria-label')).toContain('ieri, 23:40, încă nimic azi');
    // Scutecul de azi ramane "de azi", fara zi in fata orei.
    expect(tile('Scutec').textContent).not.toContain('ieri');
  });

  it('points to /babies when there is no baby yet', async () => {
    await setup('/dashboard', TODAY, []);

    expect(root().querySelectorAll('h1').length).toBe(1);
    expect(root().textContent).toContain('Niciun bebeluș încă');
    const link = root().querySelector('a[href="/babies"]');
    expect(link?.textContent).toContain('Adaugă un bebeluș');
  });
});
