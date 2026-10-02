import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { Activity, toRequest } from '../../core/models/activity';
import { QuickLogData, QuickLogLauncher } from '../../core/services/quick-log-launcher';
import { expectNoAxeViolations } from '../../core/testing/axe';
import { provideFakeClock } from '../../core/testing/fake-clock';
import { ToastOptions, ToastService } from '../../shared/overlays/toast.service';
import { QuickLogSheet } from './quick-log-sheet';

const NOW = new Date(2026, 8, 25, 16, 4);
const URL = '/api/babies/1/activities';

const feeding: Activity = {
  id: 7,
  babyId: 1,
  type: 'Feeding',
  // Cu secunde: verificam ca editarea fara schimbarea orei nu le pierde.
  occurredAt: new Date(2026, 8, 25, 14, 30, 42).toISOString(),
  notes: '120 ml lapte praf',
  amountMl: 120,
  durationMinutes: null,
  diaperKind: null,
  inProgress: false,
};

describe('QuickLogSheet', () => {
  let fixture: ComponentFixture<QuickLogSheet>;
  let httpMock: HttpTestingController;
  let close: ReturnType<typeof vi.fn>;
  let toasts: ToastOptions[];
  let edit: ReturnType<typeof vi.fn>;

  async function setup(data: Partial<QuickLogData> = {}) {
    close = vi.fn();
    toasts = [];
    edit = vi.fn().mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      imports: [QuickLogSheet],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideFakeClock(NOW).provider,
        { provide: DIALOG_DATA, useValue: { mode: 'quick', babyId: 1, babyName: 'Maria', ...data } },
        { provide: DialogRef, useValue: { close } },
        {
          provide: ToastService,
          useValue: {
            show: (options: ToastOptions) => {
              toasts.push(options);
              return { dismiss: () => undefined };
            },
          },
        },
        { provide: QuickLogLauncher, useValue: { edit } },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(QuickLogSheet);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  afterEach(() => httpMock.verify());

  const root = () => fixture.nativeElement as HTMLElement;
  const option = (label: string) =>
    Array.from(root().querySelectorAll<HTMLElement>('[role="option"]')).find((el) =>
      el.textContent?.includes(label),
    )!;
  const button = (label: string) =>
    Array.from(root().querySelectorAll<HTMLButtonElement>('button')).find((el) =>
      el.textContent?.includes(label),
    )!;
  const lastToast = () => toasts.at(-1)!;
  /** Controlul din `app-field`-ul cu eticheta data. */
  const field = (label: string) =>
    Array.from(root().querySelectorAll('app-field'))
      .find((el) => el.querySelector('label')?.textContent?.includes(label))
      ?.querySelector<HTMLInputElement>('input, textarea') ?? null;
  const type = (element: HTMLInputElement | null, value: string) => {
    element!.value = value;
    element!.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };
  const pick = (label: string) => {
    option(label).dispatchEvent(new PointerEvent('click', { bubbles: true }));
    fixture.detectChanges();
  };

  async function submitForm() {
    root().querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  describe('quick mode (2 taps)', () => {
    beforeEach(() => setup());

    it('names the baby in the title', () => {
      expect(root().querySelector('h2')?.textContent).toContain('Adaugă pentru Maria');
      expect(root().querySelector('h2')?.id).toBe('quick-log-title');
    });

    it('saves "now" with no notes on one tap and closes the sheet straight away', () => {
      option('Masă').dispatchEvent(new PointerEvent('click', { bubbles: true }));
      fixture.detectChanges();

      expect(close).toHaveBeenCalled();
      const request = httpMock.expectOne({ method: 'POST', url: URL });
      expect(request.request.body).toEqual({ type: 'Feeding', occurredAt: NOW.toISOString(), notes: null });

      request.flush({ ...feeding, occurredAt: NOW.toISOString(), notes: null });
      expect(lastToast().message).toBe('Masă înregistrată');
      expect(lastToast().action?.label).toBe('Anulează');
      expect(lastToast().secondaryAction?.label).toBe('Adaugă detalii');
    });

    it('undo deletes exactly the activity it created', () => {
      option('Somn').dispatchEvent(new PointerEvent('click', { bubbles: true }));
      const created = { id: 42, babyId: 1, type: 'Sleep', occurredAt: NOW.toISOString(), notes: null };
      httpMock.expectOne({ method: 'POST', url: URL }).flush(created);

      lastToast().action!.run();
      httpMock.expectOne({ method: 'DELETE', url: `${URL}/42` }).flush(null);
      expect(lastToast().message).toBe('Am anulat.');
    });

    it('"Adaugă detalii" opens the created activity for editing', () => {
      option('Scutec').dispatchEvent(new PointerEvent('click', { bubbles: true }));
      const created = { id: 43, babyId: 1, type: 'Diaper', occurredAt: NOW.toISOString(), notes: null };
      httpMock.expectOne({ method: 'POST', url: URL }).flush(created);

      lastToast().secondaryAction!.run();
      expect(edit).toHaveBeenCalledWith(created);
    });

    it('offers a retry with the same moment when saving fails', () => {
      option('Masă').dispatchEvent(new PointerEvent('click', { bubbles: true }));
      httpMock.expectOne({ method: 'POST', url: URL }).flush(null, { status: 0, statusText: 'offline' });

      expect(lastToast().tone).toBe('danger');
      lastToast().action!.run();
      const retry = httpMock.expectOne({ method: 'POST', url: URL });
      expect(retry.request.body.occurredAt).toBe(NOW.toISOString());
      retry.flush(feeding);
    });

    it('switches to the details form in the same sheet', async () => {
      button('Cu detalii').click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(root().querySelector('form')).not.toBeNull();
      expect(root().querySelector<HTMLInputElement>('input[type="datetime-local"]')?.value).toBe(
        '2026-09-25T16:04',
      );
    });

    it('has no AXE violations', async () => {
      await expectNoAxeViolations(fixture);
    });
  });

  describe('details mode', () => {
    beforeEach(() => setup({ mode: 'details' }));

    it('asks for a type before saving', async () => {
      await submitForm();

      expect(root().textContent).toContain('Alege tipul activității.');
      httpMock.expectNone(URL);
    });

    it('rejects a moment in the future', async () => {
      option('Masă').dispatchEvent(new PointerEvent('click', { bubbles: true }));
      const when = root().querySelector<HTMLInputElement>('input[type="datetime-local"]')!;
      when.value = '2026-09-25T18:00';
      when.dispatchEvent(new Event('input'));
      await submitForm();

      expect(root().textContent).toContain('Momentul nu poate fi în viitor.');
      httpMock.expectNone(URL);
    });

    it('uses a shortcut for "acum 15 min" and saves the trimmed notes', async () => {
      option('Masă').dispatchEvent(new PointerEvent('click', { bubbles: true }));
      button('acum 15 min').click();
      const notes = root().querySelector('textarea')!;
      notes.value = '  90 ml  ';
      notes.dispatchEvent(new Event('input'));
      await submitForm();

      const request = httpMock.expectOne({ method: 'POST', url: URL });
      expect(request.request.body).toEqual({
        type: 'Feeding',
        occurredAt: new Date(2026, 8, 25, 15, 49).toISOString(),
        notes: '90 ml',
        amountMl: null,
        durationMinutes: null,
        diaperKind: null,
        inProgress: false,
      });
      request.flush({ ...feeding, id: 50 });
      await fixture.whenStable();

      expect(close).toHaveBeenCalled();
      expect(lastToast().message).toBe('Masă înregistrată');
    });

    it('shows server validation next to the field and keeps the sheet open', async () => {
      option('Masă').dispatchEvent(new PointerEvent('click', { bubbles: true }));
      await submitForm();

      httpMock.expectOne({ method: 'POST', url: URL }).flush(
        {
          title: 'One or more validation errors occurred.',
          status: 400,
          errors: { Notes: ['Notitele nu pot depasi 500 de caractere.'] },
        },
        { status: 400, statusText: 'Bad Request' },
      );
      await fixture.whenStable();
      fixture.detectChanges();

      expect(root().textContent).toContain('Notitele nu pot depasi 500 de caractere.');
      expect(close).not.toHaveBeenCalled();
    });
  });

  describe('edit mode', () => {
    beforeEach(() => setup({ mode: 'edit', type: 'Feeding', activity: feeding }));

    it('is pre-filled and offers Șterge', () => {
      expect(root().querySelector('h2')?.textContent).toContain('Editează activitatea');
      expect(root().querySelector('textarea')?.value).toBe('120 ml lapte praf');
      expect(field('Cantitate (ml)')?.value).toBe('120');
      expect(option('Masă').getAttribute('aria-selected')).toBe('true');
      expect(button('Șterge')).toBeTruthy();
    });

    it('keeps the original moment (with its seconds) when the time is unchanged', async () => {
      await submitForm();

      const request = httpMock.expectOne({ method: 'PUT', url: `${URL}/7` });
      expect(request.request.body.occurredAt).toBe(feeding.occurredAt);
      request.flush(feeding);
      await fixture.whenStable();
    });

    it('undo after an edit puts the previous values back', async () => {
      const notes = root().querySelector('textarea')!;
      notes.value = '150 ml';
      notes.dispatchEvent(new Event('input'));
      await submitForm();
      httpMock.expectOne({ method: 'PUT', url: `${URL}/7` }).flush({ ...feeding, notes: '150 ml' });
      await fixture.whenStable();

      lastToast().action!.run();
      const undo = httpMock.expectOne({ method: 'PUT', url: `${URL}/7` });
      expect(undo.request.body).toEqual(toRequest(feeding));
      undo.flush(feeding);
    });

    it('deletes without a confirm, and undo restores exactly the same activity', () => {
      button('Șterge').click();

      expect(close).toHaveBeenCalled();
      httpMock.expectOne({ method: 'DELETE', url: `${URL}/7` }).flush(null);
      expect(lastToast().message).toBe('Activitate ștearsă');

      lastToast().action!.run();
      const restore = httpMock.expectOne({ method: 'POST', url: URL });
      // Cu tot cu detalii: "120 ml" revine ca valoare, nu doar ca text in notite.
      expect(restore.request.body).toEqual(toRequest(feeding));
      expect(restore.request.body.amountMl).toBe(120);
      restore.flush({ ...feeding, id: 99 });
      expect(lastToast().message).toBe('Am pus-o la loc.');
    });

    it('has no AXE violations', async () => {
      await expectNoAxeViolations(fixture);
    });
  });

  describe('structured details (BP-UI-20)', () => {
    it('the 2-tap Somn starts a sleep in progress', async () => {
      await setup();
      pick('Somn');

      const request = httpMock.expectOne({ method: 'POST', url: URL });
      expect(request.request.body).toEqual(expect.objectContaining({ type: 'Sleep', inProgress: true }));
      request.flush({ id: 60, babyId: 1, type: 'Sleep', occurredAt: NOW.toISOString(), notes: null, inProgress: true });
      expect(lastToast().message).toBe('Somn început');
    });

    it('shows only the fields that fit the chosen type', async () => {
      await setup({ mode: 'details' });

      pick('Masă');
      expect(field('Cantitate (ml)')).not.toBeNull();
      expect(field('Durată (minute)')).not.toBeNull();

      pick('Scutec');
      expect(field('Cantitate (ml)')).toBeNull();
      expect(field('Durată (minute)')).toBeNull();
      expect(button('Ud și murdar')).toBeTruthy();

      pick('Medicamente');
      expect(root().querySelector('.details__diaper')).toBeNull();
    });

    it('saves ml and minutes for a feed', async () => {
      await setup({ mode: 'details' });
      pick('Masă');
      type(field('Cantitate (ml)'), '150');
      Array.from(root().querySelectorAll<HTMLButtonElement>('[aria-label="Durate propuse"] button'))
        .find((chip) => chip.textContent?.trim() === '15 min')!
        .click();
      await submitForm();

      const request = httpMock.expectOne({ method: 'POST', url: URL });
      expect(request.request.body).toEqual(
        expect.objectContaining({ amountMl: 150, durationMinutes: 15, diaperKind: null, inProgress: false }),
      );
      request.flush({ ...feeding, id: 61 });
      await fixture.whenStable();
    });

    it('does not send a hidden amount after switching from Masă to Scutec', async () => {
      await setup({ mode: 'details' });
      pick('Masă');
      type(field('Cantitate (ml)'), '150');
      pick('Scutec');
      button('Murdar').click();
      fixture.detectChanges();
      await submitForm();

      const request = httpMock.expectOne({ method: 'POST', url: URL });
      expect(request.request.body).toEqual(
        expect.objectContaining({ type: 'Diaper', amountMl: null, durationMinutes: null, diaperKind: 'Dirty' }),
      );
      request.flush({ ...feeding, id: 62, type: 'Diaper' });
      await fixture.whenStable();
    });

    it('rejects an amount outside 1–500 ml before calling the API', async () => {
      await setup({ mode: 'details' });
      pick('Masă');
      type(field('Cantitate (ml)'), '900');
      await submitForm();
      fixture.detectChanges();

      expect(root().textContent).toContain('Cantitatea trebuie să fie între 1 și 500 ml.');
      httpMock.expectNone(URL);
    });

    it('waking a sleep from edit proposes the minutes slept so far', async () => {
      const sleep: Activity = {
        id: 8,
        babyId: 1,
        type: 'Sleep',
        occurredAt: new Date(2026, 8, 25, 14, 34).toISOString(),
        notes: null,
        inProgress: true,
      };
      await setup({ mode: 'edit', type: 'Sleep', activity: sleep });

      const asleep = root().querySelector<HTMLInputElement>('.details__toggle input')!;
      expect(asleep.checked).toBe(true);
      expect(field('Durată (minute)')).toBeNull();

      asleep.click();
      fixture.detectChanges();
      expect(field('Durată (minute)')?.value).toBe('90');

      await submitForm();
      const request = httpMock.expectOne({ method: 'PUT', url: `${URL}/8` });
      expect(request.request.body).toEqual(expect.objectContaining({ inProgress: false, durationMinutes: 90 }));
      request.flush({ ...sleep, inProgress: false, durationMinutes: 90 });
      await fixture.whenStable();
    });

    it('has no AXE violations with the detail fields shown', async () => {
      await setup({ mode: 'details' });
      pick('Masă');
      await expectNoAxeViolations(fixture);
      pick('Scutec');
      await expectNoAxeViolations(fixture);
    });
  });
});
