import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Card, CardPadding, CardVariant } from './card';

@Component({
  imports: [Card],
  template: `
    <app-card [variant]="variant" [tone]="tone" [padding]="padding">
      <p>Continut proiectat</p>
    </app-card>
  `,
})
class TestHost {
  variant: CardVariant = 'plain';
  tone: string | undefined;
  padding: CardPadding = 'md';
}

describe('Card', () => {
  function createHost() {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector('app-card') as HTMLElement;
    return { fixture, host };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('defaults to the plain variant with medium padding', () => {
    const { host } = createHost();

    expect(host.classList).toContain('card--plain');
    expect(host.hasAttribute('data-tone')).toBe(false);
    expect(host.querySelector('.card__pad-md')).toBeTruthy();
  });

  it('renders projected content', () => {
    const { host } = createHost();

    expect(host.textContent).toContain('Continut proiectat');
  });

  it('renders a stitch for the stitched variant', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.variant = 'stitched';
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('app-card') as HTMLElement;
    expect(host.classList).toContain('card--stitched');
    expect(host.querySelector('app-stitch')).toBeTruthy();
  });

  it('sets data-tone for the tinted variant and colors the stitch from it', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.variant = 'tinted';
    fixture.componentInstance.tone = 'feeding';
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('app-card') as HTMLElement;
    expect(host.classList).toContain('card--tinted');
    expect(host.getAttribute('data-tone')).toBe('feeding');
    expect(host.style.getPropertyValue('--stitch-color')).toBe('var(--block-line)');
  });

  it('maps the padding input to a class on the content wrapper', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.padding = 'lg';
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('app-card') as HTMLElement;
    expect(host.querySelector('.card__pad-lg')).toBeTruthy();
  });
});
