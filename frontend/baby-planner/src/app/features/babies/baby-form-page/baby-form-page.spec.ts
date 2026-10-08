import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { Baby } from '../../../core/models/baby';
import { ActiveBaby } from '../../../core/services/active-baby';
import { provideFakeClock } from '../../../core/testing/fake-clock';
import { nextRequest } from '../../../core/testing/next-request';
import { ToastOptions, ToastService } from '../../../shared/overlays/toast.service';
import { BabyForm } from '../baby-form/baby-form';
import { BabyFormPage } from './baby-form-page';

const maria: Baby = { id: 1, name: 'Maria', dateOfBirth: '2026-03-24' };

describe('BabyFormPage', () => {
  let fixture: ComponentFixture<BabyFormPage>;
  let httpMock: HttpTestingController;
  let toasts: ToastOptions[];
  let navigate: ReturnType<typeof vi.spyOn>;
  let reload: ReturnType<typeof vi.fn>;
  let select: ReturnType<typeof vi.fn>;

  function setup(babyId?: string) {
    toasts = [];
    reload = vi.fn();
    select = vi.fn();
    TestBed.configureTestingModule({
      imports: [BabyFormPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideFakeClock(new Date(2026, 8, 25, 10, 0)).provider,
        { provide: ActiveBaby, useValue: { reload, select } },
        { provide: ToastService, useValue: { show: (options: ToastOptions) => (toasts.push(options), { dismiss: () => undefined }) } },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(BabyFormPage);
    if (babyId !== undefined) {
      fixture.componentRef.setInput('babyId', babyId);
    }
    fixture.detectChanges();
  }

  afterEach(() => httpMock.verify());

  const root = () => fixture.nativeElement as HTMLElement;
  const form = () => fixture.debugElement.query(By.directive(BabyForm)).componentInstance as BabyForm;

  async function render() {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('creates a baby, makes it active and opens its profile', () => {
    setup();
    expect(root().querySelector('h1')?.textContent).toBe('Bebeluș nou');

    form().saved.emit({ id: 5, name: 'Ana', dateOfBirth: '2026-09-01' });

    expect(toasts).toEqual([{ message: 'Salvat', tone: 'success' }]);
    expect(reload).toHaveBeenCalled();
    expect(select).toHaveBeenCalledWith(5);
    expect(navigate).toHaveBeenCalledWith(['/babies', 5]);
  });

  it('goes back to the list when creating is cancelled', () => {
    setup();
    form().cancelled.emit();

    expect(navigate).toHaveBeenCalledWith(['/babies']);
  });

  it('loads the baby to edit, then saves and returns to the profile', async () => {
    setup('1');
    expect(root().querySelector('app-skeleton')).not.toBeNull();

    (await nextRequest(httpMock, '/api/babies/1')).flush(maria);
    await render();

    expect(root().querySelector('h1')?.textContent).toBe('Editează profilul');
    expect(root().querySelector('.who')?.textContent).toContain('Maria');

    form().saved.emit({ ...maria, name: 'Maria Ioana' });
    expect(reload).toHaveBeenCalled();
    expect(select).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/babies', 1]);
  });

  it('goes back to the profile when editing is cancelled', async () => {
    setup('1');
    (await nextRequest(httpMock, '/api/babies/1')).flush(maria);
    await render();

    form().cancelled.emit();

    expect(navigate).toHaveBeenCalledWith(['/babies', 1]);
  });

  it('shows "not found" for a missing baby', async () => {
    setup('9');
    (await nextRequest(httpMock, '/api/babies/9')).flush(null, { status: 404, statusText: 'Not Found' });
    await render();

    expect(root().textContent).toContain('Nu am găsit bebelușul');
  });

  it('shows "not found" for an id that is not a number, without asking the server', async () => {
    setup('abc');
    await render();

    expect(root().textContent).toContain('Nu am găsit bebelușul');
    httpMock.expectNone((request) => request.url.startsWith('/api/babies/'));
  });

  it('shows the error state on other failures and retries', async () => {
    setup('1');
    (await nextRequest(httpMock, '/api/babies/1')).flush(null, { status: 500, statusText: 'Server Error' });
    await render();
    expect(root().textContent).toContain('Nu am putut încărca profilul');

    Array.from(root().querySelectorAll('button'))
      .find((button) => button.textContent?.includes('Reîncearcă'))!
      .click();
    (await nextRequest(httpMock, '/api/babies/1')).flush(maria);
    await render();

    expect(root().querySelector('.who')?.textContent).toContain('Maria');
  });
});
