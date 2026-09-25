import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterLink, provideRouter } from '@angular/router';

import { IconButton } from './icon-button';

@Component({
  imports: [IconButton],
  template: `
    <button app-icon-button icon="close" label="Închide" variant="soft" [disabled]="disabled()" (click)="onClick()">
    </button>
  `,
})
class TestHost {
  readonly disabled = signal(false);
  clicks = 0;
  onClick(): void {
    this.clicks++;
  }
}

@Component({
  imports: [IconButton, RouterLink],
  template: `<a app-icon-button icon="back" label="Înapoi" routerLink="/babies"></a>`,
})
class LinkHost {}

describe('IconButton', () => {
  it('is a native button with the required label as its accessible name', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.tagName).toBe('BUTTON');
    expect(button.getAttribute('type')).toBe('button');
    expect(button.getAttribute('aria-label')).toBe('Închide');
    expect(button.querySelector('app-icon')).toBeTruthy();
  });

  it('applies the variant class', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.classList).toContain('icon-btn--soft');
  });

  it('disabled prevents the click handler from firing', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(fixture.componentInstance.clicks).toBe(0);
  });

  it('works on an anchor without forcing a type attribute', async () => {
    await TestBed.configureTestingModule({ providers: [provideRouter([])] }).compileComponents();
    const fixture = TestBed.createComponent(LinkHost);
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(link.getAttribute('aria-label')).toBe('Înapoi');
    expect(link.hasAttribute('type')).toBe(false);
  });
});
