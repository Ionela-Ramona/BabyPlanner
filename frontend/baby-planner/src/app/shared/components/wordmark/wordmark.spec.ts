import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Wordmark } from './wordmark';

@Component({
  imports: [Wordmark],
  template: `<app-wordmark [compact]="compact" />`,
})
class TestHost {
  compact = false;
}

describe('Wordmark', () => {
  it('shows both parts of the name and the accessible name is "BabyPlanner" (no space)', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('app-wordmark') as HTMLElement;
    expect(host.querySelector('.wordmark__baby')?.textContent).toBe('Baby');
    expect(host.querySelector('.wordmark__planner')?.textContent).toBe('Planner');
    expect(host.querySelector('.visually-hidden')?.textContent).toBe('BabyPlanner');
  });

  it('marks every visible part as decorative, so a screen reader only hears the hidden text', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('app-wordmark') as HTMLElement;
    const star = host.querySelector('svg.wordmark__star');
    const word = host.querySelector('.wordmark__word');
    expect(star?.getAttribute('aria-hidden')).toBe('true');
    expect(word?.getAttribute('aria-hidden')).toBe('true');
  });

  it('compact keeps only the star mark visible but keeps the hidden "BabyPlanner" text', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.compact = true;
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('app-wordmark') as HTMLElement;
    expect(host.querySelector('.wordmark__word')).toBeNull();
    expect(host.querySelector('svg.wordmark__star')).toBeTruthy();
    expect(host.querySelector('.visually-hidden')?.textContent).toBe('BabyPlanner');
  });
});
