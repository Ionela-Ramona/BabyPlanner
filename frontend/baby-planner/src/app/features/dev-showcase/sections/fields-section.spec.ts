import { TestBed } from '@angular/core/testing';

import { FieldsSection } from './fields-section';

describe('FieldsSection', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<FieldsSection>>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [FieldsSection] });
    fixture = TestBed.createComponent(FieldsSection);
    fixture.detectChanges();
  });

  function nameInput(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input[type="text"]');
  }

  it('does not show the required error before the field is touched', () => {
    expect(fixture.nativeElement.textContent).not.toContain('Numele este obligatoriu.');
  });

  it('shows the required error after the Nume field is blurred empty', () => {
    const input = nameInput();
    input.dispatchEvent(new Event('focus'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Numele este obligatoriu.');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('does not show an error while the field is still untouched, even if empty', () => {
    fixture.detectChanges();
    expect(nameInput().getAttribute('aria-invalid')).toBeNull();
  });

  it('maps a simulated server error onto the Nume field', () => {
    const button = Array.from(fixture.nativeElement.querySelectorAll('button')).find((element) =>
      (element as HTMLButtonElement).textContent?.includes('Simulează eroare de la server'),
    ) as HTMLButtonElement;

    button.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Numele este obligatoriu.');
    expect(fixture.nativeElement.textContent).toContain('Data nașterii nu poate fi în viitor.');
  });

  it('renders a disabled and a read-only demo field', () => {
    const disabled = fixture.nativeElement.querySelector('input[disabled]');
    const readonly = fixture.nativeElement.querySelector('input[readonly]');

    expect(disabled).toBeTruthy();
    expect(readonly).toBeTruthy();
  });
});
