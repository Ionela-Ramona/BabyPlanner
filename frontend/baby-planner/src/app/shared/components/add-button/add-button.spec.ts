import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AddButton } from './add-button';

@Component({
  imports: [AddButton],
  template: `<button app-add-button [showLabel]="showLabel()" [disabled]="disabled()" (click)="onClick()"></button>`,
})
class TestHost {
  readonly showLabel = signal(true);
  readonly disabled = signal(false);
  clicks = 0;
  onClick(): void {
    this.clicks++;
  }
}

describe('AddButton', () => {
  it('is a native button with the accessible name "Adaugă"', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.tagName).toBe('BUTTON');
    expect(button.getAttribute('type')).toBe('button');
    expect(button.getAttribute('aria-label')).toBe('Adaugă');
    expect(button.textContent).toContain('Adaugă');
  });

  it('hides the visible label when showLabel is false, keeping the aria-label', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.showLabel.set(false);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.querySelector('.add-btn__label')).toBeNull();
    expect(button.getAttribute('aria-label')).toBe('Adaugă');
  });

  it('disabled prevents the click handler from firing', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(fixture.componentInstance.clicks).toBe(0);
  });
});
