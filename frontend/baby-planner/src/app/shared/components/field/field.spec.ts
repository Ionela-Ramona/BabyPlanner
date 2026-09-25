import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Field, FieldControl } from './field';

@Component({
  selector: 'app-field-spec-host',
  imports: [Field, FieldControl],
  template: `
    <app-field label="Nume" icon="star" hint="Cum îi spuneți bebelușului" [error]="error()">
      <input appFieldControl type="text" [value]="value()" />
    </app-field>
  `,
})
class HostComponent {
  readonly error = signal<string | string[] | null>(null);
  readonly value = signal('');
}

describe('Field', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<HostComponent>>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  function label(): HTMLLabelElement {
    return fixture.nativeElement.querySelector('label');
  }

  function input(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input');
  }

  it('associates the label with the control via for/id', () => {
    expect(label().getAttribute('for')).toBe(input().id);
    expect(input().id).toBeTruthy();
  });

  it('describes the control with the hint when there is no error', () => {
    fixture.detectChanges();

    const hint = fixture.nativeElement.querySelector('.field__message--hint');
    expect(hint?.textContent).toContain('Cum îi spuneți bebelușului');
    expect(input().getAttribute('aria-describedby')).toBe(hint.id);
    expect(input().hasAttribute('aria-invalid')).toBe(false);
  });

  it('switches aria-describedby to the error and sets aria-invalid once there is an error', () => {
    fixture.componentInstance.error.set('Numele este obligatoriu.');
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('.field__message--error');
    expect(error?.textContent).toContain('Numele este obligatoriu.');
    expect(input().getAttribute('aria-describedby')).toBe(error.id);
    expect(input().getAttribute('aria-invalid')).toBe('true');

    // Indiciul dispare cat timp e eroare, ca sa nu apara doua mesaje pe acelasi rand.
    expect(fixture.nativeElement.querySelector('.field__message--hint')).toBeNull();
  });

  it('shows only the first message when several errors are given', () => {
    fixture.componentInstance.error.set(['Numele este obligatoriu.', 'Al doilea mesaj.']);
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('.field__message--error');
    expect(error?.textContent).toContain('Numele este obligatoriu.');
    expect(error?.textContent).not.toContain('Al doilea mesaj.');
  });

  it('renders the field icon as decorative (no accessible name of its own)', () => {
    const icon = fixture.nativeElement.querySelector('.field__icon');
    expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(icon.getAttribute('role')).toBeNull();
  });

  it('applies the field-control class used by the global field styles', () => {
    expect(input().classList.contains('field-control')).toBe(true);
  });
});
