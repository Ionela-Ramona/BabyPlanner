import { Component, inject, input, linkedSignal, output, signal } from '@angular/core';
import {
  FieldState,
  FormField,
  ValidationError,
  form,
  required,
  submit,
  validate,
} from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';

import { Baby, CreateBabyRequest } from '../../../core/models/baby';
import { BabyApi } from '../../../core/services/baby-api';
import { Clock } from '../../../core/services/clock';
import { Button } from '../../../shared/components/button/button';
import { Field, FieldControl } from '../../../shared/components/field/field';
import { Icon } from '../../../shared/components/icon/icon';
import { mapProblemToFields } from '../../../shared/utils/problem-mapping';
import { toIsoDate } from '../baby-format';

/** Aceeasi limita ca in backend (CreateBabyRequestValidator, BabyConfiguration). */
export const BABY_NAME_MAX_LENGTH = 100;

interface BabyFormModel {
  name: string;
  dateOfBirth: string;
}

/**
 * Formularul unui bebelus (Nume + Data nasterii), folosit de "Bebeluș nou",
 * "Editează" si de prima pornire (/welcome).
 *
 * Face singur cererea (POST sau PUT, dupa cum primeste `baby`) si pune erorile
 * serverului langa campuri; pagina care il foloseste decide doar ce urmeaza dupa
 * `saved` (toast, navigare). Asa cele trei ecrane nu repeta validarea.
 */
@Component({
  selector: 'app-baby-form',
  imports: [Button, Field, FieldControl, FormField, Icon],
  template: `
    <form class="baby-form" novalidate (submit)="onSubmit($event)">
      <app-field label="Nume" icon="star" [error]="errorsOf(babyForm.name())">
        <input
          appFieldControl
          type="text"
          autocomplete="off"
          autocapitalize="words"
          placeholder="ex. Maria"
          [formField]="babyForm.name"
        />
      </app-field>

      <app-field label="Data nașterii" icon="calendar" [error]="errorsOf(babyForm.dateOfBirth())">
        <input appFieldControl type="date" [formField]="babyForm.dateOfBirth" />
      </app-field>

      @if (formError(); as message) {
        <p class="baby-form__error" role="alert">
          <app-icon name="alert" [size]="18" />
          <span>{{ message }}</span>
        </p>
      }

      <div class="baby-form__actions">
        <button type="submit" appButton size="lg" [loading]="babyForm().submitting()">
          {{ submitLabel() }}
        </button>
        @if (cancellable()) {
          <button type="button" appButton variant="ghost" size="lg" (click)="cancelled.emit()">
            Anulează
          </button>
        }
      </div>
    </form>
  `,
  styles: `
    .baby-form {
      display: grid;
      gap: var(--space-5);
    }

    .baby-form__error {
      display: flex;
      align-items: flex-start;
      gap: var(--space-2);
      margin: 0;
      color: var(--color-danger-ink);
      font-size: var(--text-small);
    }

    .baby-form__actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      margin-top: var(--space-2);
    }
  `,
})
export class BabyForm {
  private readonly babyApi = inject(BabyApi);
  private readonly clock = inject(Clock);

  /** Bebelusul de editat; lipsa = formular de creare. */
  readonly baby = input<Baby>();

  readonly submitLabel = input('Salvează');

  /** Pe prima pornire nu avem unde ne intoarce, deci nici "Anulează". */
  readonly cancellable = input(true);

  readonly saved = output<Baby>();
  readonly cancelled = output<void>();

  /** Eroare care nu tine de un camp (server oprit, 404, 500). */
  protected readonly formError = signal<string | null>(null);

  // linkedSignal: cand `baby` soseste (editare), modelul se completeaza singur.
  private readonly model = linkedSignal<BabyFormModel>(() => ({
    name: this.baby()?.name ?? '',
    dateOfBirth: this.baby()?.dateOfBirth ?? '',
  }));

  protected readonly babyForm = form(this.model, (path) => {
    required(path.name, { message: 'Numele este obligatoriu.' });
    validate(path.name, ({ value }) => {
      const trimmed = value().trim();
      if (value().length > 0 && trimmed.length === 0) {
        return { kind: 'blank', message: 'Numele este obligatoriu.' };
      }
      return trimmed.length > BABY_NAME_MAX_LENGTH
        ? {
            kind: 'too-long',
            message: `Numele poate avea cel mult ${BABY_NAME_MAX_LENGTH} de caractere.`,
          }
        : undefined;
    });

    required(path.dateOfBirth, { message: 'Data nașterii este obligatorie.' });
    // Comparam siruri "YYYY-MM-DD": ordinea lexicografica e si ordinea calendaristica.
    validate(path.dateOfBirth, ({ value }) =>
      value() && value() > toIsoDate(this.clock.today())
        ? { kind: 'future-date', message: 'Data nașterii nu poate fi în viitor.' }
        : undefined,
    );
  });

  /** Erorile apar dupa blur sau dupa "Salvează", nu la prima tasta. */
  protected errorsOf(state: FieldState<unknown>): string[] {
    return state.touched() ? state.errors().map((error) => error.message ?? 'Câmp invalid.') : [];
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.formError.set(null);

    await submit(this.babyForm, async (field) => {
      const value = field().value();
      const request: CreateBabyRequest = {
        name: value.name.trim(),
        dateOfBirth: value.dateOfBirth,
      };
      const existing = this.baby();

      try {
        const saved = await firstValueFrom(
          existing ? this.babyApi.update(existing.id, request) : this.babyApi.create(request),
        );
        this.saved.emit(saved);
        return undefined;
      } catch (error) {
        return this.toSubmissionErrors(error);
      }
    });
  }

  /**
   * Erorile serverului devin erori de trimitere ale campurilor: Signal Forms le
   * sterge singur cand valoarea campului se schimba, deci nu raman "lipite".
   */
  private toSubmissionErrors(error: unknown): ValidationError.WithOptionalFieldTree[] {
    const { fieldErrors, formError } = mapProblemToFields(error);
    const errors: ValidationError.WithOptionalFieldTree[] = [];
    const leftovers: string[] = formError ? [formError] : [];

    for (const [key, messages] of Object.entries(fieldErrors)) {
      const target =
        key === 'name' ? this.babyForm.name : key === 'dateOfBirth' ? this.babyForm.dateOfBirth : null;
      if (target) {
        errors.push(...messages.map((message) => ({ kind: 'server', message, fieldTree: target })));
      } else {
        leftovers.push(...messages);
      }
    }

    this.formError.set(leftovers.length ? leftovers.join(' ') : null);
    return errors;
  }
}
