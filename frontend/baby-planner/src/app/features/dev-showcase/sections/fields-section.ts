import { Component, inject, signal } from '@angular/core';
import {
  FieldState,
  FormField,
  RootFieldContext,
  form,
  required,
  submit,
  validate,
} from '@angular/forms/signals';

import { Clock } from '../../../core/services/clock';
import { Button } from '../../../shared/components/button/button';
import { Field, FieldControl } from '../../../shared/components/field/field';
import { mapProblemToFields } from '../../../shared/utils/problem-mapping';

/** Formularul demonstrativ: aceleasi 4 campuri pe care le vor folosi formularul de bebelus si cel de activitate. */
interface DemoBabyBookModel {
  name: string;
  dateOfBirth: string;
  occurredAt: string;
  notes: string;
}

/**
 * O eroare de validare "de server", exact in forma in care vine din API
 * (`ValidationProblemDetails`), folosita de butonul "Simulează eroare de la server".
 */
const SAMPLE_SERVER_ERROR = {
  type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
  title: 'One or more validation errors occurred.',
  status: 400,
  errors: {
    Name: ['Numele este obligatoriu.'],
    DateOfBirth: ['Data nașterii nu poate fi în viitor.'],
  },
};

/** Un `Date` (din `Clock`), ca text "YYYY-MM-DD" local — comparam siruri, nu obiecte Date. */
function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * `datetime-local` da un text fara fus ("2026-09-25T08:30"), citit ca ora locala.
 * Conversia la UTC se face o singura data, la trimitere — nu la fiecare tasta si
 * nu in modelul campului, care ramane textul local cat timp omul il editeaza.
 */
function localDateTimeToUtcIso(local: string): string | null {
  if (!local) {
    return null;
  }
  const parsed = new Date(local);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/** Sectiunea "Câmpuri de formular" din vitrina: `app-field` in toate starile lui. */
@Component({
  selector: 'app-fields-section',
  imports: [Button, Field, FieldControl, FormField],
  template: `
    <section class="showcase-section">
      <h3>Câmpuri de formular</h3>
      <p class="text-muted">
        Randul "Date: ……" din referinta, cu Signal Forms si erori de la server.
      </p>

      <form class="demo-form" (submit)="onSubmit($event)">
        <app-field label="Nume" icon="star" [error]="displayErrors(demoForm.name())">
          <input appFieldControl type="text" placeholder="ex. Maria" [formField]="demoForm.name" />
        </app-field>

        <app-field
          label="Data nașterii"
          icon="calendar"
          hint="ZZ.LL.AAAA"
          [error]="displayErrors(demoForm.dateOfBirth())"
        >
          <input appFieldControl type="date" [formField]="demoForm.dateOfBirth" />
        </app-field>

        <app-field
          label="Când"
          icon="clock"
          hint="Ora locală; se trimite la server ca UTC"
          [error]="displayErrors(demoForm.occurredAt())"
        >
          <input appFieldControl type="datetime-local" [formField]="demoForm.occurredAt" />
        </app-field>

        <app-field label="Notițe" icon="note" [error]="displayErrors(demoForm.notes())">
          <textarea appFieldControl placeholder="ex. 120 ml lapte praf" [formField]="demoForm.notes"></textarea>
        </app-field>

        <div class="demo-form__actions">
          <button type="submit" appButton size="md">Trimite</button>
          <button type="button" appButton variant="secondary" size="md" (click)="simulateServerError()">
            Simulează eroare de la server
          </button>
          <button type="button" appButton variant="ghost" size="md" (click)="reset()">Resetare</button>
        </div>

        @if (submitted()) {
          <p class="demo-form__status" role="status">
            Formular trimis (demo, nimic nu se salvează). "Când" pleacă la server ca
            {{ submittedOccurredAtUtc() ?? '—' }} (UTC).
          </p>
        }
      </form>

      <div class="demo-states">
        <app-field label="Nume (dezactivat)" icon="star" hint="Nu se poate edita acum">
          <input appFieldControl type="text" value="Maria" disabled />
        </app-field>

        <app-field label="Nume (doar citire)" icon="star" hint="Setat la crearea profilului">
          <input appFieldControl type="text" value="Maria" readonly />
        </app-field>
      </div>
    </section>
  `,
  styles: `
    .demo-form {
      display: grid;
      gap: var(--space-5);
      max-width: 26rem;
    }

    .demo-form__actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
    }

    .demo-form__status {
      margin: 0;
      color: var(--color-success-ink);
      font-size: var(--text-small);
    }

    .demo-states {
      display: grid;
      gap: var(--space-5);
      max-width: 26rem;
      margin-top: var(--space-6);
    }
  `,
})
export class FieldsSection {
  private readonly clock = inject(Clock);

  /** Erori "de server" curente, pe numele local al campului; golite cand campul devine dirty. */
  private readonly serverErrors = signal<Record<string, string[]>>({});

  protected readonly submitted = signal(false);
  protected readonly submittedOccurredAtUtc = signal<string | null>(null);

  protected readonly demoModel = signal<DemoBabyBookModel>({
    name: '',
    dateOfBirth: '',
    occurredAt: '',
    notes: '',
  });

  protected readonly demoForm = form(this.demoModel, (path) => {
    required(path.name, { message: 'Numele este obligatoriu.' });
    validate(path.name, ({ value }) =>
      value().length > 0 && value().trim().length === 0
        ? { kind: 'blank', message: 'Numele este obligatoriu.' }
        : undefined,
    );
    validate(path.name, (ctx) => this.serverError(ctx, 'name'));

    validate(path.dateOfBirth, ({ value }) =>
      value() && value() > toIsoDate(this.clock.today())
        ? { kind: 'future-date', message: 'Data nașterii nu poate fi în viitor.' }
        : undefined,
    );
    validate(path.dateOfBirth, (ctx) => this.serverError(ctx, 'dateOfBirth'));

    validate(path.occurredAt, (ctx) => this.serverError(ctx, 'occurredAt'));
    validate(path.notes, (ctx) => this.serverError(ctx, 'notes'));
  });

  /** Erorile afisate numai dupa blur/submit (campul devine "touched"), nu la fiecare tasta. */
  protected displayErrors(state: FieldState<unknown>): string[] {
    return state.touched() ? state.errors().map((error) => error.message ?? 'Câmp invalid.') : [];
  }

  protected simulateServerError(): void {
    const { fieldErrors } = mapProblemToFields(SAMPLE_SERVER_ERROR);
    this.serverErrors.set(fieldErrors);
    // Ca la un submit real: o eroare de server marcheaza formularul "atins", ca sa se vada imediat.
    this.demoForm().markAsTouched();
  }

  protected reset(): void {
    this.demoForm().reset({ name: '', dateOfBirth: '', occurredAt: '', notes: '' });
    this.serverErrors.set({});
    this.submitted.set(false);
    this.submittedOccurredAtUtc.set(null);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.set(false);
    // Formular de vitrina: actiunea nu trimite nimic la un server real.
    void submit(this.demoForm, async (field) => {
      this.submittedOccurredAtUtc.set(localDateTimeToUtcIso(field().value().occurredAt));
      this.submitted.set(true);
      return undefined;
    });
  }

  /** O eroare de server ramane vizibila pana cand campul e modificat (dirty). */
  private serverError(ctx: RootFieldContext<unknown>, field: keyof DemoBabyBookModel) {
    if (ctx.state.dirty()) {
      return undefined;
    }
    const messages = this.serverErrors()[field];
    return messages?.length ? messages.map((message) => ({ kind: 'server', message })) : undefined;
  }
}
