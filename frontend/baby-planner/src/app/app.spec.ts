import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';
import { routes } from './app.routes';
import { Baby } from './core/models/baby';

const MARIA: Baby = { id: 1, name: 'Maria', dateOfBirth: '2026-03-01' };
const ANDREI: Baby = { id: 2, name: 'Andrei', dateOfBirth: '2025-11-20' };

describe('App', () => {
  beforeEach(async () => {
    try {
      localStorage.clear();
    } catch {
      // jsdom are localStorage; blocul e doar pentru simetrie cu codul de productie.
    }

    await TestBed.configureTestingModule({
      imports: [App],
      // Shell-ul contine router-outlet, routerLink si incarca lista de bebelusi.
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify({ ignoreCancelled: true });
  });

  async function render(babies: Baby[]) {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    TestBed.inject(HttpTestingController)
      .match((request) => request.url.endsWith('/babies'))
      .forEach((request) => request.flush(babies));
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('keeps the skip link as the first focusable element', async () => {
    const root = await render([MARIA]);
    const first = root.querySelector('a, button, input');

    expect(first?.textContent).toContain('Sari la conținut');
    expect(first?.getAttribute('href')).toBe('#continut');
    expect(root.querySelector('main#continut')?.getAttribute('tabindex')).toBe('-1');
  });

  it('renders the wordmark with a single accessible name', async () => {
    const root = await render([MARIA]);
    const home = root.querySelector('.topbar__home');

    expect(home?.getAttribute('aria-label')).toBe('BabyPlanner, pagina Azi');
    expect(home?.querySelector('app-wordmark')).not.toBeNull();
  });

  it('exposes one main navigation, after <main>, with Azi, Adaugă, Istoric and Bebeluși', async () => {
    const root = await render([MARIA]);
    const navs = root.querySelectorAll('nav');

    expect(navs.length).toBe(1);
    expect(navs[0].getAttribute('aria-label')).toBe('Navigare principală');

    const main = root.querySelector('main')!;
    expect(main.compareDocumentPosition(navs[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    const labels = Array.from(navs[0].querySelectorAll('.nav__label')).map((el) =>
      el.textContent?.trim(),
    );
    expect(labels).toEqual(['Azi', 'Istoric', 'Bebeluși']);
    expect(navs[0].querySelector('button[app-add-button]')?.getAttribute('aria-label')).toBe('Adaugă');
  });

  it('points Istoric at the active baby', async () => {
    const root = await render([MARIA]);
    const history = Array.from(root.querySelectorAll<HTMLAnchorElement>('nav a')).find((a) =>
      a.textContent?.includes('Istoric'),
    );

    expect(history?.getAttribute('href')).toBe('/babies/1/activities');
  });

  it('shows the single baby as plain text, without a menu', async () => {
    const root = await render([MARIA]);

    expect(root.querySelector('.switcher__single')?.textContent).toContain('Maria');
    expect(root.querySelector('[ngMenuTrigger], .switcher__trigger')).toBeNull();
  });

  it('turns the baby into a menu button when there are several', async () => {
    const root = await render([MARIA, ANDREI]);
    const trigger = root.querySelector('.switcher__trigger');

    // Angular Aria pune "true", echivalentul ARIA pentru "menu".
    expect(trigger?.getAttribute('aria-haspopup')).toBe('true');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    expect(trigger?.getAttribute('aria-label')).toContain('Maria');
  });

  it('offers the three theme choices as a radio group', async () => {
    const root = await render([MARIA]);
    const radios = root.querySelectorAll<HTMLInputElement>('input[type="radio"][name="bp-theme"]');

    expect(radios.length).toBe(3);
    expect(root.querySelector('fieldset legend')?.textContent).toContain('Temă');
  });

  it('no longer renders the learning-project footer', async () => {
    const root = await render([MARIA]);

    expect(root.querySelector('footer')).toBeNull();
  });
});
