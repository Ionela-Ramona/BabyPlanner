import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterLink, provideRouter } from '@angular/router';

import { Button, ButtonVariant } from './button';

@Component({
  imports: [Button],
  template: `
    <button appButton [variant]="variant" [loading]="loading()" [disabled]="disabled()" (click)="onClick()">
      Salvează
    </button>
  `,
})
class TestHost {
  variant: ButtonVariant = 'primary';
  readonly loading = signal(false);
  readonly disabled = signal(false);
  clicks = 0;
  onClick(): void {
    this.clicks++;
  }
}

@Component({
  imports: [Button, RouterLink],
  template: `<a appButton [variant]="variant" routerLink="/babies">Toți bebelușii</a>`,
})
class LinkHost {
  variant: ButtonVariant = 'secondary';
}

describe('Button (appButton)', () => {
  it('disabled prevents the click handler from firing', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(fixture.componentInstance.clicks).toBe(0);
  });

  it('loading sets aria-busy and the loading class', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.loading.set(true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.classList).toContain('btn--loading');
  });

  it('applies variant classes on a native button', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.classList).toContain('btn');
    expect(button.classList).toContain('btn--primary');
  });

  it('applies variant classes on an anchor with routerLink', async () => {
    await TestBed.configureTestingModule({ providers: [provideRouter([])] }).compileComponents();
    const fixture = TestBed.createComponent(LinkHost);
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(link.classList).toContain('btn');
    expect(link.classList).toContain('btn--secondary');
  });
});
