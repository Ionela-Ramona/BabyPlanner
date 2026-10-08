import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Baby } from '../../../core/models/baby';
import { expectNoAxeViolations } from '../../../core/testing/axe';
import { provideFakeClock } from '../../../core/testing/fake-clock';
import { nextRequest } from '../../../core/testing/next-request';
import { BabyList } from './baby-list';

const maria: Baby = { id: 1, name: 'Maria', dateOfBirth: '2026-03-24' };
const ion: Baby = { id: 2, name: 'Ion', dateOfBirth: '2025-12-01' };

describe('BabyList', () => {
  let fixture: ComponentFixture<BabyList>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BabyList],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideFakeClock(new Date(2026, 8, 25, 10, 0)).provider,
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(BabyList);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  const root = () => fixture.nativeElement as HTMLElement;

  async function serve(respond: (request: Awaited<ReturnType<typeof nextRequest>>) => void) {
    respond(await nextRequest(httpMock, '/api/babies'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('shows a skeleton while the list loads', async () => {
    expect(root().querySelector('app-skeleton')).not.toBeNull();
    await serve((request) => request.flush([]));
  });

  it('shows each baby with age, birth date, profile and history links', async () => {
    await serve((request) => request.flush([maria, ion]));

    const links = Array.from(root().querySelectorAll('a'));
    expect(root().querySelectorAll('li')).toHaveLength(2);
    expect(root().textContent).toContain('6 luni');
    expect(root().textContent).toContain('Data nașterii: 24 martie 2026');
    expect(links.find((link) => link.textContent?.trim() === 'Maria')?.getAttribute('href')).toBe('/babies/1');
    expect(links.find((link) => link.getAttribute('aria-label') === 'Istoric pentru Ion')?.getAttribute('href')).toBe(
      '/babies/2/activities',
    );
    expect(links.filter((link) => link.getAttribute('href') === '/babies/new')).toHaveLength(1);
    await expectNoAxeViolations(fixture);
  });

  it('shows the empty state with a single add link when there are no babies', async () => {
    await serve((request) => request.flush([]));

    expect(root().textContent).toContain('Niciun bebeluș încă');
    expect(root().querySelectorAll('a[href="/babies/new"]')).toHaveLength(1);
  });

  it('shows the error state and retries', async () => {
    await serve((request) => request.flush(null, { status: 500, statusText: 'Server Error' }));

    expect(root().textContent).toContain('Nu am putut încărca lista');
    expect(root().querySelector('a[href="/babies/new"]')).toBeNull();

    Array.from(root().querySelectorAll('button'))
      .find((button) => button.textContent?.includes('Reîncearcă'))!
      .click();
    await serve((request) => request.flush([maria]));

    expect(root().querySelectorAll('li')).toHaveLength(1);
  });
});
