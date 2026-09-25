import { Component, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  FieldState,
  FormField,
  ReadonlyFieldTree,
  ValidationError,
  form,
  submit,
} from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';

import { CreateBabyRequest } from '../../../core/models/baby';
import { BabyApi } from '../../../core/services/baby-api';
import { mapProblemToFields } from '../../utils/problem-mapping';
import { Field, FieldControl } from './field';

/**
 * Reteta reala pe care o vor folosi formularele de bebelus/activitate: Signal Forms +
 * `app-field` + `BabyApi` + `mapProblemToFields`. Verifica end-to-end ca un 400 de
 * validare de la server ajunge, prin `submit()`, exact pe campul lui din formular —
 * nu doar intr-un mesaj generic la nivel de formular.
 */
@Component({
  selector: 'app-field-http-integration-host',
  imports: [Field, FieldControl, FormField],
  template: `
    <form (submit)="onSubmit($event)">
      <app-field label="Nume" icon="star" [error]="displayErrors(babyForm.name())">
        <input appFieldControl type="text" [formField]="babyForm.name" />
      </app-field>

      <app-field label="Data nașterii" icon="calendar" [error]="displayErrors(babyForm.dateOfBirth())">
        <input appFieldControl type="date" [formField]="babyForm.dateOfBirth" />
      </app-field>

      <button type="submit">Trimite</button>
    </form>
  `,
})
class HostComponent {
  private readonly babyApi = inject(BabyApi);

  protected readonly model = signal<CreateBabyRequest>({ name: '', dateOfBirth: '2026-01-01' });
  protected readonly babyForm = form(this.model);

  protected displayErrors(state: FieldState<unknown>): string[] {
    return state.touched() ? state.errors().map((error) => error.message ?? '') : [];
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    void submit(this.babyForm, async (field) => {
      try {
        await firstValueFrom(this.babyApi.create(field().value()));
        return undefined;
      } catch (error) {
        const { fieldErrors } = mapProblemToFields(error);
        const errors: ValidationError.WithOptionalFieldTree[] = [];

        for (const [key, messages] of Object.entries(fieldErrors)) {
          const target = this.babyForm[key as keyof CreateBabyRequest] as unknown as ReadonlyFieldTree<unknown>;
          for (const message of messages) {
            errors.push({ kind: 'server', message, fieldTree: target });
          }
        }

        return errors;
      }
    });
  }
}

describe('app-field + Signal Forms + server validation (integration)', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<HostComponent>>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    fixture = TestBed.createComponent(HostComponent);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('shows the server-mapped message under the Nume field after a 400 response', async () => {
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

    const request = httpMock.expectOne('/api/babies');
    expect(request.request.method).toBe('POST');
    request.flush(
      { title: 'One or more validation errors occurred.', errors: { Name: ['Numele este obligatoriu.'] } },
      { status: 400, statusText: 'Bad Request' },
    );

    // submit() e async: lasam microtask-urile promisiunii sa se rezolve.
    await fixture.whenStable();
    fixture.detectChanges();

    const nameField = fixture.nativeElement.querySelector('app-field');
    expect(nameField?.textContent).toContain('Numele este obligatoriu.');

    const input = fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});
