import { TestBed } from '@angular/core/testing';

import { expectNoAxeViolations } from '../testing/axe';
import { ThemeService } from '../services/theme';
import { ThemeToggle } from './theme-toggle';

describe('ThemeToggle', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  function render() {
    const fixture = TestBed.createComponent(ThemeToggle);
    fixture.detectChanges();
    const radios = () =>
      Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLInputElement>('input[type="radio"]'));
    return { fixture, radios };
  }

  it('is a native radio group named "Temă", with the current preference checked', async () => {
    const { fixture, radios } = render();

    expect((fixture.nativeElement as HTMLElement).querySelector('legend')?.textContent).toBe('Temă');
    expect(radios().map((radio) => [radio.value, radio.parentElement!.textContent!.trim()])).toEqual([
      ['system', 'Ca sistemul'],
      ['light', 'Luminos'],
      ['dark', 'Noapte'],
    ]);
    expect(radios().find((radio) => radio.checked)?.value).toBe(TestBed.inject(ThemeService).preference());
    await expectNoAxeViolations(fixture);
  });

  it('switches the theme when an option is chosen', () => {
    const { fixture, radios } = render();

    radios()[2].click();
    fixture.detectChanges();

    expect(TestBed.inject(ThemeService).preference()).toBe('dark');
    expect(radios()[2].checked).toBe(true);
  });
});
