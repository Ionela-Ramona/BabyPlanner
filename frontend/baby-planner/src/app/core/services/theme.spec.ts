import { TestBed } from '@angular/core/testing';

import { BACKGROUND_STORAGE_KEY, ThemeService } from './theme';

describe('ThemeService background', () => {
  const root = document.documentElement;

  beforeEach(() => {
    localStorage.clear();
    root.removeAttribute('data-background');
    root.removeAttribute('data-theme');
  });

  afterEach(() => {
    localStorage.clear();
    root.removeAttribute('data-background');
    root.removeAttribute('data-theme');
  });

  it('starts on cream, without a data-background attribute', () => {
    const theme = TestBed.inject(ThemeService);
    TestBed.tick();

    expect(theme.background()).toBe('cream');
    expect(root.hasAttribute('data-background')).toBe(false);
  });

  it('applies the chosen background to <html> and remembers it', () => {
    const theme = TestBed.inject(ThemeService);

    theme.setBackground('rose');
    TestBed.tick();

    expect(theme.background()).toBe('rose');
    expect(root.getAttribute('data-background')).toBe('rose');
    expect(localStorage.getItem(BACKGROUND_STORAGE_KEY)).toBe('rose');
  });

  it('clears the attribute and the stored value when going back to cream', () => {
    const theme = TestBed.inject(ThemeService);
    theme.setBackground('mint');
    TestBed.tick();

    theme.setBackground('cream');
    TestBed.tick();

    expect(root.hasAttribute('data-background')).toBe(false);
    expect(localStorage.getItem(BACKGROUND_STORAGE_KEY)).toBeNull();
  });

  it('restores the stored background on startup', () => {
    localStorage.setItem(BACKGROUND_STORAGE_KEY, 'lavender');

    const theme = TestBed.inject(ThemeService);
    TestBed.tick();

    expect(theme.background()).toBe('lavender');
    expect(root.getAttribute('data-background')).toBe('lavender');
  });

  it('ignores an unknown stored value', () => {
    localStorage.setItem(BACKGROUND_STORAGE_KEY, 'neon');

    const theme = TestBed.inject(ThemeService);
    TestBed.tick();

    expect(theme.background()).toBe('cream');
    expect(root.hasAttribute('data-background')).toBe(false);
  });
});
