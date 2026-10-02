import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { Baby } from '../../../core/models/baby';
import { expectNoAxeViolations } from '../../../core/testing/axe';
import { provideFakeClock } from '../../../core/testing/fake-clock';
import { BabyForm } from './baby-form';

describe('BabyForm', () => {
  let fixture: ComponentFixture<BabyForm>;
  let httpMock: HttpTestingController;
  let saved: ReturnType<typeof vi.fn<(baby: Baby) => void>>;

  async function setup(baby?: Baby) {
    TestBed.configureTestingModule({
      imports: [BabyForm],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideFakeClock(new Date(2026, 8, 25, 10, 0)).provider],
    });
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(BabyForm);
    if (baby) {
      fixture.componentRef.setInput('baby', baby);
    }
    saved = vi.fn<(baby: Baby) => void>();
    fixture.componentInstance.saved.subscribe(saved);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  afterEach(() => httpMock.verify());

  const root = () => fixture.nativeElement as HTMLElement;
  const input = (type: string) => root().querySelector<HTMLInputElement>(`input[type="${type}"]`)!;

  function type(element: HTMLInputElement, value: string) {
    element.value = value;
    element.dispatchEvent(new Event('input'));
  }

  async function submit() {
    root().querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('requires a name and a birth date, with Romanian messages', async () => {
    await setup();
    await submit();

    expect(root().textContent).toContain('Numele este obligatoriu.');
    expect(root().textContent).toContain('Data nașterii este obligatorie.');
    expect(input('text').getAttribute('aria-invalid')).toBe('true');
    httpMock.expectNone('/api/babies');
  });

  it('rejects a name made only of spaces', async () => {
    await setup();
    type(input('text'), '   ');
    type(input('date'), '2026-03-24');
    await submit();

    expect(root().textContent).toContain('Numele este obligatoriu.');
    httpMock.expectNone('/api/babies');
  });

  it('rejects a birth date in the future', async () => {
    await setup();
    type(input('text'), 'Maria');
    type(input('date'), '2026-09-26');
    await submit();

    expect(root().textContent).toContain('Data nașterii nu poate fi în viitor.');
    httpMock.expectNone('/api/babies');
  });

  it('creates the baby with a trimmed name and emits saved', async () => {
    await setup();
    type(input('text'), '  Maria  ');
    type(input('date'), '2026-03-24');
    await submit();

    const request = httpMock.expectOne({ method: 'POST', url: '/api/babies' });
    expect(request.request.body).toEqual({ name: 'Maria', dateOfBirth: '2026-03-24' });
    request.flush({ id: 3, name: 'Maria', dateOfBirth: '2026-03-24' });
    await fixture.whenStable();

    expect(saved).toHaveBeenCalledWith({ id: 3, name: 'Maria', dateOfBirth: '2026-03-24' });
  });

  it('edits an existing baby with PUT, pre-filled', async () => {
    await setup({ id: 1, name: 'Maria', dateOfBirth: '2026-03-24' });
    expect(input('text').value).toBe('Maria');

    type(input('text'), 'Maria Ioana');
    await submit();

    const request = httpMock.expectOne({ method: 'PUT', url: '/api/babies/1' });
    expect(request.request.body).toEqual({ name: 'Maria Ioana', dateOfBirth: '2026-03-24' });
    request.flush({ id: 1, name: 'Maria Ioana', dateOfBirth: '2026-03-24' });
    await fixture.whenStable();
  });

  it('shows server validation next to the field', async () => {
    await setup();
    type(input('text'), 'Maria');
    type(input('date'), '2026-03-24');
    await submit();

    httpMock.expectOne({ method: 'POST', url: '/api/babies' }).flush(
      { title: 'Validation', status: 400, errors: { Name: ['Numele nu poate depasi 100 de caractere.'] } },
      { status: 400, statusText: 'Bad Request' },
    );
    // Erorile ajung in formular dupa ce promisiunea din submit() se rezolva (un task in plus).
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(root().textContent).toContain('Numele nu poate depasi 100 de caractere.');
    expect(saved).not.toHaveBeenCalled();
  });

  it('has no AXE violations', async () => {
    await setup();
    await expectNoAxeViolations(fixture);
  });
});
