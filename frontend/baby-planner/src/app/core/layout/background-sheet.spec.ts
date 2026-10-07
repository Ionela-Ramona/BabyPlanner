import { DialogRef } from '@angular/cdk/dialog';
import { TestBed } from '@angular/core/testing';

import { ThemeService } from '../services/theme';
import { expectNoAxeViolations } from '../testing/axe';
import { BackgroundSheet } from './background-sheet';

describe('BackgroundSheet', () => {
  let close: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    close = vi.fn();
    TestBed.configureTestingModule({
      providers: [{ provide: DialogRef, useValue: { close } }],
    });
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-background');
  });

  function render() {
    const fixture = TestBed.createComponent(BackgroundSheet);
    fixture.detectChanges();
    return { fixture, root: fixture.nativeElement as HTMLElement };
  }

  function radios(root: HTMLElement): HTMLInputElement[] {
    return Array.from(root.querySelectorAll<HTMLInputElement>('input[type="radio"][name="bp-background"]'));
  }

  it('offers every background as a labelled radio, with the current one checked', () => {
    const { root } = render();

    const names = Array.from(root.querySelectorAll('.backgrounds__name')).map((el) => el.textContent?.trim());
    expect(names).toEqual(['Crem', 'Roz', 'Mentă', 'Bleu', 'Lavandă']);
    expect(radios(root).filter((radio) => radio.checked).map((radio) => radio.value)).toEqual(['cream']);
    expect(root.querySelector('fieldset.backgrounds legend')?.textContent).toContain('Culoarea fundalului');
  });

  it('offers the three theme choices as a labelled radio group', () => {
    const { root } = render();
    const themes = root.querySelectorAll<HTMLInputElement>('input[type="radio"][name="bp-theme"]');

    expect(themes.length).toBe(3);
    expect(root.querySelector('app-theme-toggle legend')?.textContent).toContain('Temă');
    expect(root.querySelector('app-theme-toggle')?.textContent).toContain('Noapte');
  });

  it('applies the background as soon as an option is picked', () => {
    const { fixture, root } = render();
    const rose = radios(root).find((radio) => radio.value === 'rose')!;

    rose.click();
    fixture.detectChanges();
    TestBed.tick();

    expect(TestBed.inject(ThemeService).background()).toBe('rose');
    expect(document.documentElement.getAttribute('data-background')).toBe('rose');
    expect(rose.checked).toBe(true);
  });

  it('previews each palette on its swatch', () => {
    const { root } = render();
    const previews = Array.from(root.querySelectorAll('[data-background-preview]')).map((el) =>
      el.getAttribute('data-background-preview'),
    );

    expect(previews).toEqual(['cream', 'rose', 'mint', 'sky', 'lavender']);
  });

  it('closes from "Gata"', () => {
    const { root } = render();
    const done = Array.from(root.querySelectorAll('button')).find((b) => b.textContent?.includes('Gata'));

    done!.click();

    expect(close).toHaveBeenCalled();
  });

  it('has no axe violations', async () => {
    const { fixture } = render();

    await expectNoAxeViolations(fixture);
  });
});
