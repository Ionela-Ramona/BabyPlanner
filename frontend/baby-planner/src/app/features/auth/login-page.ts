import { HttpErrorResponse } from '@angular/common/http';
import { NgOptimizedImage } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FieldState,
  FormField,
  ValidationError,
  email,
  form,
  required,
  submit,
  validate,
} from '@angular/forms/signals';
import { Router } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';

import { Credentials } from '../../core/models/auth';
import { AuthService } from '../../core/services/auth';
import { Button } from '../../shared/components/button/button';
import { Card } from '../../shared/components/card/card';
import { Field, FieldControl } from '../../shared/components/field/field';
import { Icon } from '../../shared/components/icon/icon';
import { mapProblemToFields } from '../../shared/utils/problem-mapping';

/** Aceeasi limita ca in backend (RegisterRequestValidator). */
export const PASSWORD_MIN_LENGTH = 8;

type Mode = 'login' | 'register';

/**
 * Intrarea in aplicatie: login sau cont nou, pe aceeasi pagina (aceleasi doua campuri,
 * alt buton). Dupa succes mergem la Azi; un cont nou, fara bebelusi, ajunge de acolo
 * la /welcome, unde isi adauga bebelusul.
 */
@Component({
  selector: 'app-login-page',
  imports: [Button, Card, Field, FieldControl, FormField, Icon, NgOptimizedImage],
  template: `
    <img
      class="login__art"
      ngSrc="illustrations/bunting.svg"
      width="200"
      height="62"
      alt=""
      priority
    />
    <h1 class="login__title script">{{ mode() === 'login' ? 'Bine ai revenit!' : 'Bun venit!' }}</h1>
    <p class="login__lead">
      {{ mode() === 'login' ? 'Intră în cont ca să vezi ziua bebelușului.' : 'Creează un cont, apoi adaugă bebelușul.' }}
    </p>

    <app-card variant="stitched" padding="lg">
      <form class="login__form" novalidate (submit)="onSubmit($event)">
        <app-field label="Email" [error]="errorsOf(loginForm.email())">
          <input
            appFieldControl
            type="email"
            autocomplete="username"
            autocapitalize="off"
            spellcheck="false"
            [formField]="loginForm.email"
          />
        </app-field>

        <app-field
          label="Parolă"
          [hint]="mode() === 'register' ? 'Cel puțin ' + minLength + ' caractere.' : undefined"
          [error]="errorsOf(loginForm.password())"
        >
          <input
            appFieldControl
            type="password"
            [attr.autocomplete]="mode() === 'login' ? 'current-password' : 'new-password'"
            [formField]="loginForm.password"
          />
        </app-field>

        @if (formError(); as message) {
          <p class="login__error" role="alert">
            <app-icon name="alert" [size]="18" />
            <span>{{ message }}</span>
          </p>
        }

        <button type="submit" appButton size="lg" block [loading]="loginForm().submitting()">
          {{ mode() === 'login' ? 'Intră în cont' : 'Creează contul' }}
        </button>
      </form>
    </app-card>

    <p class="login__switch">
      {{ mode() === 'login' ? 'Nu ai cont?' : 'Ai deja cont?' }}
      <button type="button" appButton variant="ghost" (click)="toggleMode()">
        {{ mode() === 'login' ? 'Creează unul' : 'Intră în cont' }}
      </button>
    </p>
  `,
  styles: `
    :host {
      display: grid;
      justify-items: center;
      max-width: 30rem;
      margin-inline: auto;
      padding-top: var(--space-6);
      text-align: center;
    }

    .login__art {
      width: min(14rem, 70%);
      height: auto;
    }

    .login__title {
      margin: var(--space-4) 0 0;
      color: var(--honey-ink);
      font-size: 3.25rem;
      line-height: 1.1;
    }

    .login__lead {
      margin: var(--space-2) 0 var(--space-8);
      color: var(--color-text);
      font-size: var(--text-lead);
    }

    app-card {
      width: 100%;
      text-align: start;
    }

    .login__form {
      display: grid;
      gap: var(--space-5);
    }

    .login__error {
      display: flex;
      align-items: flex-start;
      gap: var(--space-2);
      margin: 0;
      color: var(--color-danger-ink);
      font-size: var(--text-small);
    }

    .login__switch {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: var(--space-1);
      margin: var(--space-6) 0 0;
      color: var(--color-text-muted);
    }
  `,
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly minLength = PASSWORD_MIN_LENGTH;
  protected readonly mode = signal<Mode>('login');

  /** Eroare care nu tine de un camp (parola gresita, server oprit, prea multe incercari). */
  protected readonly formError = signal<string | null>(null);

  private readonly model = signal<Credentials>({ email: '', password: '' });

  protected readonly loginForm = form(this.model, (path) => {
    required(path.email, { message: 'Emailul este obligatoriu.' });
    email(path.email, { message: 'Emailul nu pare valid.' });
    required(path.password, { message: 'Parola este obligatorie.' });
    // Lungimea minima conteaza doar la un cont nou; la login o verifica serverul.
    validate(path.password, ({ value }) =>
      this.mode() === 'register' && value().length > 0 && value().length < PASSWORD_MIN_LENGTH
        ? { kind: 'too-short', message: `Parola trebuie să aibă cel puțin ${PASSWORD_MIN_LENGTH} caractere.` }
        : undefined,
    );
  });

  protected toggleMode(): void {
    this.mode.update((mode) => (mode === 'login' ? 'register' : 'login'));
    this.formError.set(null);
  }

  /** Erorile apar dupa blur sau dupa trimitere, nu la prima tasta. */
  protected errorsOf(state: FieldState<unknown>): string[] {
    return state.touched() ? state.errors().map((error) => error.message ?? 'Câmp invalid.') : [];
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.formError.set(null);

    await submit(this.loginForm, async (field) => {
      const value = field().value();
      const credentials: Credentials = { email: value.email.trim(), password: value.password };
      const request: Observable<void> =
        this.mode() === 'login' ? this.auth.login(credentials) : this.auth.register(credentials);

      try {
        await firstValueFrom(request);
        // Un cont nou nu are bebelusi: garda de pe /dashboard il trimite la /welcome.
        await this.router.navigateByUrl('/dashboard');
        return undefined;
      } catch (error) {
        return this.toSubmissionErrors(error);
      }
    });
  }

  private toSubmissionErrors(error: unknown): ValidationError.WithOptionalFieldTree[] {
    // Limita de cereri a serverului raspunde fara corp; mesajul il dam noi.
    if (error instanceof HttpErrorResponse && error.status === 429) {
      this.formError.set('Prea multe încercări. Mai încearcă peste un minut.');
      return [];
    }

    const { fieldErrors, formError } = mapProblemToFields(error);
    const errors: ValidationError.WithOptionalFieldTree[] = [];
    const leftovers: string[] = formError ? [formError] : [];

    for (const [key, messages] of Object.entries(fieldErrors)) {
      const target =
        key === 'email' ? this.loginForm.email : key === 'password' ? this.loginForm.password : null;
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
