import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, ElementRef, afterNextRender, computed, inject, Injector, linkedSignal, signal } from '@angular/core';
import { FieldState, FormField, ValidationError, form, required, submit, validate } from '@angular/forms/signals';
import { Observable, firstValueFrom } from 'rxjs';

import {
  Activity,
  CreateActivityRequest,
  DIAPER_KINDS,
  DIAPER_KIND_LABELS,
  DiaperKind,
  toRequest,
} from '../../core/models/activity';
import { ACTIVITY_META, ActivityType } from '../../core/models/activity-type';
import { ActivityLog, MAX_DURATION_MINUTES, sleptMinutes } from '../../core/services/activity-log';
import { Clock } from '../../core/services/clock';
import { QuickLogData, QuickLogLauncher } from '../../core/services/quick-log-launcher';
import { ActivityPicker } from '../../shared/components/activity-picker/activity-picker';
import { Button } from '../../shared/components/button/button';
import { Field, FieldControl } from '../../shared/components/field/field';
import { Icon } from '../../shared/components/icon/icon';
import { SheetFooter } from '../../shared/overlays/sheet-footer';
import { SheetHeader } from '../../shared/overlays/sheet-header';
import { ToastService } from '../../shared/overlays/toast.service';
import { durationLabel } from '../../shared/utils/activity-details';
import { mapProblemToFields } from '../../shared/utils/problem-mapping';
import { fromLocalInputValue, toLocalInputValue } from '../../shared/utils/ro-time';

/** Aceeasi limita ca in backend (CreateActivityRequestValidator, ActivityConfiguration). */
export const NOTES_MAX_LENGTH = 500;
/** Aceleasi limite ca ActivityRules din backend. */
export const MIN_AMOUNT_ML = 1;
export const MAX_AMOUNT_ML = 500;

/** Backendul accepta cateva minute "in viitor", pentru un ceas de telefon putin inainte. */
const FUTURE_TOLERANCE_MS = 5 * 60_000;

/** Scurtaturile de langa "Când": parintele noteaza de obicei ceva ce tocmai s-a terminat. */
const MINUTES_AGO = [5, 15, 30] as const;

const SAVE_FAILED = 'Nu am putut salva. Verifică conexiunea și încearcă din nou.';
const UNDO_FAILED = 'Nu am putut anula. Verifică conexiunea și încearcă din nou.';

/** Duratele propuse ca scurtaturi, pe tip (alaptarea e scurta, somnul nu). */
const DURATION_CHIPS: Partial<Record<ActivityType, readonly number[]>> = {
  Feeding: [10, 15, 20],
  Sleep: [30, 45, 60, 90, 120],
};

interface DetailsModel {
  /** "YYYY-MM-DDTHH:mm", ora locala, ca in `<input type="datetime-local">`. */
  when: string;
  notes: string;
  /**
   * Text, nu numar: campurile sunt `inputmode="numeric"` (tastatura cu cifre pe
   * telefon), iar un camp gol inseamna "nenotat", nu 0.
   */
  amountMl: string;
  durationMinutes: string;
}

/** "" -> null; altfel numarul intreg, sau NaN daca textul nu e un intreg. */
function parseWhole(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  return /^\d+$/.test(trimmed) ? Number(trimmed) : Number.NaN;
}

/**
 * Foaia "＋ Adaugă" (BP-UI-15), in trei moduri (vezi `QuickLogMode`):
 *
 * - **quick**: cuburile de tip. O atingere salveaza "acum", fara notite, si inchide
 *   foaia — impreuna cu ＋ Adaugă, doua atingeri. Toastul ofera "Anulează" si
 *   "Adaugă detalii".
 * - **details**: tip, "Când" si "Notițe", pentru o activitate noua.
 * - **edit**: acelasi formular, completat, cu "Șterge" in subsol.
 *
 * Foaia se inchide inainte sa raspunda serverul (interfata optimista): parintele nu
 * asteapta reteaua cu bebelusul in brate. Daca cererea pica, un toast de eroare
 * ofera reincercarea, iar listele raman cum erau (se reincarca doar dupa succes,
 * prin `ActivityChanges`). Fiecare salvare si stergere are "Anulează" in toast,
 * nu o confirmare inainte: e mai rapid si la fel de sigur.
 */
@Component({
  selector: 'app-quick-log-sheet',
  imports: [ActivityPicker, Button, Field, FieldControl, FormField, Icon, SheetFooter, SheetHeader],
  template: `
    <app-sheet-header
      titleId="quick-log-title"
      [title]="title()"
      [subtitle]="subtitle()"
      (close)="dialogRef.close()"
    />

    @if (mode() === 'quick') {
      <p class="hint text-muted">Atinge ce s-a întâmplat și se salvează cu ora de acum.</p>
      <app-activity-picker label="Ce s-a întâmplat?" (picked)="quickSave($event)" />

      <app-sheet-footer>
        <button appButton variant="secondary" type="button" (click)="showDetails()">
          <app-icon name="note" />
          Cu detalii
        </button>
      </app-sheet-footer>
    } @else {
      <form class="details" novalidate (submit)="onSubmit($event)">
        <div class="details__type">
          <p class="details__label" aria-hidden="true">Tip</p>
          <app-activity-picker label="Tip" [value]="type()" (valueChange)="setType($event)" />
          @if (typeError(); as message) {
            <p class="details__error" role="alert">
              <app-icon name="alert" [size]="16" />
              <span>{{ message }}</span>
            </p>
          }
        </div>

        <div class="details__when">
          <app-field label="Când" icon="clock" [error]="errorsOf(detailsForm.when())">
            <input appFieldControl type="datetime-local" [formField]="detailsForm.when" />
          </app-field>
          <div class="details__shortcuts" role="group" aria-label="Scurtături pentru „Când”">
            <button type="button" class="shortcut" (click)="setMinutesAgo(0)">acum</button>
            @for (minutes of minutesAgo; track minutes) {
              <button type="button" class="shortcut" (click)="setMinutesAgo(minutes)">
                acum {{ minutes }} min
              </button>
            }
          </div>
        </div>

        <!-- Detaliile structurate (BP-UI-20): doar campurile care au sens pentru tipul ales. -->
        @if (type() === 'Sleep') {
          <label class="details__toggle">
            <input type="checkbox" [checked]="inProgress()" (change)="setInProgress($any($event.target).checked)" />
            <span>Încă doarme</span>
          </label>
        }

        @if (showsAmount()) {
          <app-field label="Cantitate (ml)" icon="feeding" hint="Opțional, pentru biberon" [error]="errorsOf(detailsForm.amountMl())">
            <input appFieldControl type="text" inputmode="numeric" autocomplete="off" placeholder="ex. 120" [formField]="detailsForm.amountMl" />
          </app-field>
        }

        @if (showsDuration()) {
          <div>
            <app-field
              label="Durată (minute)"
              icon="clock"
              [hint]="type() === 'Feeding' ? 'Opțional, pentru alăptare' : 'Opțional'"
              [error]="errorsOf(detailsForm.durationMinutes())"
            >
              <input appFieldControl type="text" inputmode="numeric" autocomplete="off" placeholder="ex. 45" [formField]="detailsForm.durationMinutes" />
            </app-field>
            <div class="details__shortcuts" role="group" aria-label="Durate propuse">
              @for (minutes of durationChips(); track minutes) {
                <button type="button" class="shortcut" (click)="setDuration(minutes)">{{ durationText(minutes) }}</button>
              }
            </div>
          </div>
        }

        @if (type() === 'Diaper') {
          <div class="details__diaper" role="group" aria-labelledby="quick-log-diaper">
            <p class="details__label" id="quick-log-diaper">Scutecul (opțional)</p>
            <div class="details__shortcuts">
              @for (kind of diaperKinds; track kind) {
                <button
                  type="button"
                  class="shortcut"
                  [attr.aria-pressed]="diaperKind() === kind"
                  (click)="toggleDiaperKind(kind)"
                >
                  {{ diaperLabels[kind] }}
                </button>
              }
            </div>
          </div>
        }

        <app-field label="Notițe" icon="note" hint="Opțional" [error]="errorsOf(detailsForm.notes())">
          <textarea appFieldControl rows="3" [placeholder]="notesPlaceholder()" [formField]="detailsForm.notes"></textarea>
        </app-field>

        @if (formError(); as message) {
          <p class="details__error" role="alert">
            <app-icon name="alert" [size]="16" />
            <span>{{ message }}</span>
          </p>
        }

        <app-sheet-footer>
          @if (editing(); as activity) {
            <button appButton variant="danger" type="button" class="details__delete" (click)="remove(activity)">
              <app-icon name="delete" />
              Șterge
            </button>
          }
          <button appButton type="submit" [loading]="detailsForm().submitting()">
            <app-icon name="check" />
            Salvează
          </button>
        </app-sheet-footer>
      </form>
    }
  `,
  styles: `
    :host {
      display: block;
    }

    @media (min-width: 48rem) {
      :host {
        width: 28rem;
      }
    }

    .hint {
      margin: 0 0 var(--space-4);
    }

    .details {
      display: grid;
      gap: var(--space-5);
    }

    .details__label {
      margin: 0 0 var(--space-2);
      color: var(--color-text-muted);
      font-size: var(--text-small);
      font-weight: 600;
    }

    .details__error {
      display: flex;
      align-items: flex-start;
      gap: var(--space-1);
      margin: var(--space-2) 0 0;
      color: var(--color-danger-ink);
      font-size: var(--text-caption);
    }

    .details__shortcuts {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin-top: var(--space-2);
    }

    .shortcut {
      min-height: var(--tap-min);
      padding: 0 var(--space-3);
      border: 1px solid var(--honey-line);
      border-radius: var(--radius-pill);
      background-color: var(--color-surface);
      color: var(--color-text);
      font: inherit;
      font-size: var(--text-small);
      cursor: pointer;
      transition: background-color var(--dur-fast) var(--ease-out);
    }

    .shortcut:hover,
    .shortcut[aria-pressed='true'] {
      background-color: var(--honey-soft);
    }

    .shortcut[aria-pressed='true'] {
      box-shadow: inset 0 0 0 1px var(--honey-line);
      font-weight: 700;
    }

    .details__toggle {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      min-height: var(--tap-min);
      font-weight: 700;
      cursor: pointer;
    }

    .details__toggle input {
      width: 1.25rem;
      height: 1.25rem;
      accent-color: var(--act-sleep-line);
    }

    .details__delete {
      margin-inline-end: auto;
    }

    @media (max-width: 47.9375rem) {
      .details__delete {
        margin-inline-end: 0;
      }
    }
  `,
})
export class QuickLogSheet {
  protected readonly data = inject<QuickLogData>(DIALOG_DATA);
  protected readonly dialogRef = inject(DialogRef);
  private readonly activityLog = inject(ActivityLog);
  private readonly clock = inject(Clock);
  private readonly toasts = inject(ToastService);
  private readonly launcher = inject(QuickLogLauncher);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  protected readonly minutesAgo = MINUTES_AGO;

  /** `quick` poate trece in `details` ("Cu detalii"); celelalte moduri raman cum au pornit. */
  protected readonly mode = signal(this.data.mode);
  protected readonly editing = computed(() => (this.data.mode === 'edit' ? this.data.activity : undefined));

  protected readonly type = signal<ActivityType | undefined>(this.data.type ?? this.data.activity?.type);
  protected readonly typeError = signal<string | null>(null);
  /** Eroare care nu tine de un camp (server oprit, 404). */
  protected readonly formError = signal<string | null>(null);

  protected readonly title = computed(() =>
    this.editing() ? 'Editează activitatea' : `Adaugă pentru ${this.data.babyName}`,
  );
  protected readonly subtitle = computed(() => (this.editing() ? `pentru ${this.data.babyName}` : undefined));

  protected readonly notesPlaceholder = computed(() => {
    const type = this.type();
    return type ? ACTIVITY_META[type].notesPlaceholder : 'Ce merită ținut minte?';
  });

  /** Valoarea de pornire a lui "Când", ca sa stim daca parintele a schimbat-o. */
  private readonly initialWhen = this.data.activity
    ? toLocalInputValue(new Date(this.data.activity.occurredAt))
    : toLocalInputValue(this.clock.now());

  private readonly model = linkedSignal<DetailsModel>(() => ({
    when: this.initialWhen,
    notes: this.data.activity?.notes ?? '',
    amountMl: this.data.activity?.amountMl?.toString() ?? '',
    durationMinutes: this.data.activity?.durationMinutes?.toString() ?? '',
  }));

  // Detaliile care nu sunt text (stari de buton), tinute langa tip, in afara formularului.
  protected readonly diaperKinds = DIAPER_KINDS;
  protected readonly diaperLabels = DIAPER_KIND_LABELS;
  protected readonly diaperKind = signal<DiaperKind | null>(this.data.activity?.diaperKind ?? null);
  protected readonly inProgress = signal(this.data.activity?.inProgress ?? false);

  protected readonly showsAmount = computed(() => this.type() === 'Feeding');
  protected readonly showsDuration = computed(
    () => this.type() === 'Feeding' || (this.type() === 'Sleep' && !this.inProgress()),
  );
  protected readonly durationChips = computed(() => {
    const type = this.type();
    return (type && DURATION_CHIPS[type]) || [];
  });
  protected readonly durationText = durationLabel;

  protected readonly detailsForm = form(this.model, (path) => {
    required(path.when, { message: 'Alege data și ora.' });
    validate(path.when, ({ value }) =>
      value() && Date.parse(fromLocalInputValue(value())) > this.clock.now().getTime() + FUTURE_TOLERANCE_MS
        ? { kind: 'future', message: 'Momentul nu poate fi în viitor.' }
        : undefined,
    );
    validate(path.notes, ({ value }) =>
      value().trim().length > NOTES_MAX_LENGTH
        ? { kind: 'too-long', message: `Notițele pot avea cel mult ${NOTES_MAX_LENGTH} de caractere.` }
        : undefined,
    );
    // Aceleasi limite ca ActivityRules din backend; un camp ascuns pentru tipul ales nu se valideaza.
    validate(path.amountMl, ({ value }) => {
      const amount = parseWhole(value());
      return this.showsAmount() && amount !== null && !(amount >= MIN_AMOUNT_ML && amount <= MAX_AMOUNT_ML)
        ? { kind: 'range', message: `Cantitatea trebuie să fie între ${MIN_AMOUNT_ML} și ${MAX_AMOUNT_ML} ml.` }
        : undefined;
    });
    validate(path.durationMinutes, ({ value }) => {
      const minutes = parseWhole(value());
      return this.showsDuration() && minutes !== null && !(minutes >= 1 && minutes <= MAX_DURATION_MINUTES)
        ? { kind: 'range', message: `Durata trebuie să fie între 1 și ${MAX_DURATION_MINUTES} de minute.` }
        : undefined;
    });
  });

  /** Erorile apar dupa blur sau dupa "Salvează", nu la prima tasta. */
  protected errorsOf(state: FieldState<unknown>): string[] {
    return state.touched() ? state.errors().map((error) => error.message ?? 'Câmp invalid.') : [];
  }

  protected setType(type: ActivityType | undefined): void {
    this.type.set(type);
    if (type) {
      this.typeError.set(null);
    }
  }

  protected setDuration(minutes: number): void {
    this.detailsForm.durationMinutes().value.set(String(minutes));
  }

  /** A doua apasare pe acelasi tip de scutec il scoate (detaliul e optional). */
  protected toggleDiaperKind(kind: DiaperKind): void {
    this.diaperKind.update((current) => (current === kind ? null : kind));
  }

  /**
   * Debifat la un somn in desfasurare = "s-a trezit": propunem ca durata timpul
   * scurs de la adormire, ca parintele sa nu-l calculeze singur.
   */
  protected setInProgress(value: boolean): void {
    this.inProgress.set(value);
    const existing = this.editing();
    if (!value && existing?.inProgress && !this.detailsForm.durationMinutes().value()) {
      this.setDuration(sleptMinutes(existing, this.clock.now()));
    }
  }

  protected setMinutesAgo(minutes: number): void {
    const when = new Date(this.clock.now().getTime() - minutes * 60_000);
    this.detailsForm.when().value.set(toLocalInputValue(when));
  }

  /**
   * "Cu detalii": butonul apasat dispare odata cu modul rapid, deci mutam focusul
   * pe primul cub, altfel ar cadea pe `<body>` si cititorul de ecran s-ar pierde.
   */
  protected showDetails(): void {
    this.mode.set('details');
    // `ngListbox` da `tabindex="0"` cubului activ abia dupa primul sau ciclu de
    // randare, deci cautam din nou pe cadrul urmator inainte sa cadem pe "Când".
    const focusFirstBlock = (attemptsLeft: number) => {
      const root = this.host.nativeElement;
      const block = root.querySelector<HTMLElement>('.details [role="option"][tabindex="0"]');
      if (block || attemptsLeft === 0) {
        (block ?? root.querySelector<HTMLElement>('.details input'))?.focus();
      } else {
        requestAnimationFrame(() => focusFirstBlock(attemptsLeft - 1));
      }
    };
    afterNextRender(() => focusFirstBlock(3), { injector: this.injector });
  }

  /**
   * A doua atingere din calea rapida: salveaza "acum" si inchide foaia imediat.
   * Somnul porneste "in desfasurare": parintele il noteaza cand adoarme bebelusul
   * si il incheie cu "S-a trezit" de pe Azi, care ii calculeaza durata.
   */
  protected quickSave(type: ActivityType): void {
    const request: CreateActivityRequest = {
      type,
      occurredAt: this.clock.now().toISOString(),
      notes: null,
      ...(type === 'Sleep' ? { inProgress: true } : {}),
    };
    this.dialogRef.close();
    this.createInBackground(request);
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.formError.set(null);
    if (!this.type()) {
      this.typeError.set('Alege tipul activității.');
    }

    await submit(this.detailsForm, async (field) => {
      const type = this.type();
      if (!type) {
        return undefined;
      }
      const value = field().value();
      const existing = this.editing();
      // Doar detaliile vizibile pentru tipul ales; restul pleaca `null`, ca schimbarea
      // tipului (de ex. din Masă in Scutec) sa nu lase in urma "120 ml" pe un scutec.
      const inProgress = type === 'Sleep' && this.inProgress();
      const request: CreateActivityRequest = {
        type,
        // Neschimbat la editare: trimitem momentul original, cu secundele lui, nu unul rotunjit la minut.
        occurredAt:
          existing && value.when === this.initialWhen ? existing.occurredAt : fromLocalInputValue(value.when),
        notes: value.notes.trim() || null,
        amountMl: this.showsAmount() ? parseWhole(value.amountMl) : null,
        durationMinutes: this.showsDuration() ? parseWhole(value.durationMinutes) : null,
        diaperKind: type === 'Diaper' ? this.diaperKind() : null,
        inProgress,
      };

      try {
        if (existing) {
          const saved = await firstValueFrom(this.activityLog.update(this.data.babyId, existing.id, request));
          this.dialogRef.close();
          this.offerUndo('Modificări salvate', () =>
            this.activityLog.update(this.data.babyId, saved.id, toRequest(existing)),
          );
        } else {
          const saved = await firstValueFrom(this.activityLog.create(this.data.babyId, request));
          this.dialogRef.close();
          this.offerUndo(ACTIVITY_META[saved.type].copy.logged, () =>
            this.activityLog.remove(this.data.babyId, saved),
          );
        }
        return undefined;
      } catch (error) {
        return this.toSubmissionErrors(error);
      }
    });
  }

  /** Fara confirmare: stergerea se poate anula din toast (activitatea revine printr-un POST). */
  protected remove(activity: Activity): void {
    this.dialogRef.close();
    this.activityLog.remove(this.data.babyId, activity).subscribe({
      next: () =>
        this.offerUndo('Activitate ștearsă', () => this.activityLog.restore(activity), 'Am pus-o la loc.'),
      error: () =>
        this.toasts.show({
          message: 'Nu am putut șterge. Verifică conexiunea și încearcă din nou.',
          tone: 'danger',
          action: { label: 'Încearcă din nou', run: () => this.remove(activity) },
        }),
    });
  }

  private createInBackground(request: CreateActivityRequest): void {
    this.activityLog.create(this.data.babyId, request).subscribe({
      next: (saved) =>
        this.toasts.show({
          message: saved.inProgress ? 'Somn început' : ACTIVITY_META[saved.type].copy.logged,
          tone: 'success',
          action: { label: 'Anulează', run: () => this.undo(() => this.activityLog.remove(this.data.babyId, saved)) },
          secondaryAction: { label: 'Adaugă detalii', run: () => void this.launcher.edit(saved) },
        }),
      error: () =>
        this.toasts.show({
          message: SAVE_FAILED,
          tone: 'danger',
          // Acelasi moment ca la prima incercare, nu "acum"-ul reincercarii.
          action: { label: 'Încearcă din nou', run: () => this.createInBackground(request) },
        }),
    });
  }

  private offerUndo(message: string, undo: () => Observable<unknown>, undoneMessage?: string): void {
    this.toasts.show({
      message,
      tone: 'success',
      action: { label: 'Anulează', run: () => this.undo(undo, undoneMessage) },
    });
  }

  private undo(undo: () => Observable<unknown>, undoneMessage = 'Am anulat.'): void {
    undo().subscribe({
      next: () => this.toasts.show({ message: undoneMessage, tone: 'info' }),
      error: () => this.toasts.show({ message: UNDO_FAILED, tone: 'danger' }),
    });
  }

  /** Erorile serverului ajung langa campul lor; ce nu tine de un camp ajunge sub formular. */
  private toSubmissionErrors(error: unknown): ValidationError.WithOptionalFieldTree[] {
    const { fieldErrors, formError } = mapProblemToFields(error, { occurredAt: 'when' });
    const errors: ValidationError.WithOptionalFieldTree[] = [];
    const leftovers: string[] = formError ? [formError] : [];
    const fields = {
      when: this.detailsForm.when,
      notes: this.detailsForm.notes,
      amountMl: this.detailsForm.amountMl,
      durationMinutes: this.detailsForm.durationMinutes,
    } as const;

    for (const [key, messages] of Object.entries(fieldErrors)) {
      const target = key in fields ? fields[key as keyof typeof fields] : null;
      if (target) {
        errors.push(...messages.map((message) => ({ kind: 'server', message, fieldTree: target })));
      } else if (key === 'type') {
        this.typeError.set(messages[0] ?? null);
      } else {
        leftovers.push(...messages);
      }
    }

    this.formError.set(leftovers.length ? leftovers.join(' ') : null);
    return errors;
  }
}
