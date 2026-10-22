import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { expectNoAxeViolations } from '../../core/testing/axe';
import { LoginPage } from './login-page';

const SESSION = { token: 'abc', email: 'ana@test.ro', expiresAt: '2999-01-01T00:00:00Z' };

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.clear();
  });

  async function render() {
    const fixture = TestBed.createComponent(LoginPage);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const input = (type: string) => root.querySelector<HTMLInputElement>(`input[type="${type}"]`)!;
    const type = (element: HTMLInputElement, value: string) => {
      element.value = value;
      element.dispatchEvent(new Event('input'));
    };
    const submit = async () => {
      root.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
      await fixture.whenStable();
    };
    return { fixture, root, input, type, submit };
  }

  it('is an accessible login form that switches to "create account"', async () => {
    const { fixture, root, input } = await render();

    expect(root.querySelector('h1')?.textContent).toBe('Bine ai revenit!');
    expect(input('email').getAttribute('autocomplete')).toBe('username');
    expect(input('password').getAttribute('autocomplete')).toBe('current-password');
    await expectNoAxeViolations(fixture);

    Array.from(root.querySelectorAll('button')).find((b) => b.textContent?.includes('Creează unul'))!.click();
    await fixture.whenStable();

    expect(root.querySelector('button[type="submit"]')?.textContent).toContain('Creează contul');
    expect(input('password').getAttribute('autocomplete')).toBe('new-password');
    await expectNoAxeViolations(fixture);
  });

  it('logs in and goes to Azi', async () => {
    const navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const { input, type, submit } = await render();

    type(input('email'), ' ana@test.ro ');
    type(input('password'), 'parola-buna');
    const submitted = submit();
    const request = TestBed.inject(HttpTestingController).expectOne('/api/auth/login');
    expect(request.request.body).toEqual({ email: 'ana@test.ro', password: 'parola-buna' });
    request.flush(SESSION);
    await submitted;

    expect(navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('shows a wrong password as a form error, without leaving the page', async () => {
    const navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl');
    const { fixture, root, input, type, submit } = await render();

    type(input('email'), 'ana@test.ro');
    type(input('password'), 'gresita');
    const submitted = submit();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/auth/login')
      .flush({ status: 401, detail: 'Email sau parolă greșită.' }, { status: 401, statusText: 'Unauthorized' });
    await submitted;
    fixture.detectChanges();

    expect(root.querySelector('[role="alert"]')?.textContent).toContain('Email sau parolă greșită.');
    expect(navigateByUrl).not.toHaveBeenCalled();
  });

  it('checks the password length only when creating an account', async () => {
    const { fixture, root, input, type, submit } = await render();
    Array.from(root.querySelectorAll('button')).find((b) => b.textContent?.includes('Creează unul'))!.click();
    await fixture.whenStable();

    type(input('email'), 'ana@test.ro');
    type(input('password'), 'scurta');
    await submit();
    fixture.detectChanges();

    expect(root.textContent).toContain('Parola trebuie să aibă cel puțin 8 caractere.');
    TestBed.inject(HttpTestingController).expectNone('/api/auth/register');
  });
});
