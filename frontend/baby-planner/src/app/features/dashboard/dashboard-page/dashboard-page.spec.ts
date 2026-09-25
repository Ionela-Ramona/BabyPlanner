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

describe('DashboardPage', () => {
  let httpMock: HttpTestingController;
  let harness: RouterTestingHarness;
  let clock: FakeClock;
  let launcher: { open: ReturnType<typeof vi.fn>; edit: ReturnType<typeof vi.fn> };

  beforeEach(() => {
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

  async function settle(): Promise<void> {
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
    await settle();
    if (babies.length === 0) {
      return;
    }
    const request = httpMock.expectOne(TODAY_URL);
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
    await settle();
    httpMock.expectOne(TODAY_URL).flush(TODAY);
    await settle();

    const headings = root().querySelectorAll('h1');
    expect(headings.length).toBe(1);
    expect(headings[0].textContent?.trim()).toBe('Maria');
    expect(headings[0].querySelector('.script')).not.toBeNull();
    expect(root().textContent).toContain('6 luni');
    expect(root().querySelector('app-ribbon')?.textContent).toContain('Azi · vineri, 25 septembrie');
  });

  it('computes the tiles from the data: core types plus any other type present today', async () => {
    await setup();

    expect(tileLabels()).toEqual(['Masă', 'Somn', 'Scutec', 'Medicamente']);
    expect(tile('Masă').getAttribute('aria-label')).toBe('Masă: ultima acum 5 ore, la 15:30, 3 mese azi');
    expect(tile('Masă').textContent).toContain('acum 5 ore');
    expect(tile('Masă').textContent).toContain('15:30');
    expect(tile('Somn').textContent).toContain('1 somn');
    expect(tile('Masă').getAttribute('aria-pressed')).toBe('false');
  });

  it('invites logging from a tile with nothing today instead of filtering', async () => {
    await setup('/dashboard', TODAY.filter((activity) => activity.type !== 'Sleep'));

    const sleep = tile('Somn');
    expect(sleep.textContent).toContain('Încă nimic azi');
    expect(sleep.hasAttribute('aria-pressed')).toBe(false);

    sleep.click();
    await settle();

    expect(launcher.open).toHaveBeenCalledWith('Sleep');
    expect(url()).toBe('/dashboard');
  });

  it('filters the timeline from a tile, reflects it in the URL, and clears it on a second tap', async () => {
    await setup();

    tile('Masă').click();
    await settle();

    expect(url()).toBe('/dashboard?type=Feeding');
    expect(tile('Masă').getAttribute('aria-pressed')).toBe('true');
    expect(rowNames().every((name) => name.startsWith('Masă'))).toBe(true);
    expect(rowNames().length).toBe(3);

    tile('Masă').click();
    await settle();

    expect(url()).toBe('/dashboard');
    expect(rowNames().length).toBe(TODAY.length);
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
    expect(tile('Somn').getAttribute('aria-pressed')).toBe('true');
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
    await harness.fixture.whenStable().catch(() => undefined);
    TestBed.tick();
    harness.detectChanges();

    const request = httpMock.expectOne(TODAY_URL);
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
    expect(tileLabels()).toEqual(['Masă', 'Somn', 'Scutec']);

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
    TestBed.tick();
    httpMock.expectOne(TODAY_URL).flush(TODAY);
    await settle();

    expect(root().querySelector('[role="alert"]')).toBeNull();
    expect(rowNames().length).toBe(TODAY.length);
  });

  it('points to /babies when there is no baby yet', async () => {
    await setup('/dashboard', TODAY, []);

    expect(root().querySelectorAll('h1').length).toBe(1);
    expect(root().textContent).toContain('Niciun bebeluș încă');
    const link = root().querySelector('a[href="/babies"]');
    expect(link?.textContent).toContain('Adaugă un bebeluș');
  });
});
