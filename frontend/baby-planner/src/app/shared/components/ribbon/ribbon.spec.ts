import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Ribbon, RibbonSize } from './ribbon';

@Component({
  imports: [Ribbon],
  template: `
    <h2><app-ribbon [size]="size()" [decorated]="decorated()">Mari amintiri</app-ribbon></h2>
  `,
})
class Host {
  readonly size = signal<RibbonSize>('md');
  readonly decorated = signal(false);
}

describe('Ribbon', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    return { fixture, root, ribbon: root.querySelector('app-ribbon') as HTMLElement };
  }

  it('should project its text so the caller heading keeps the accessible name', async () => {
    const { root } = await setup();

    expect(root.querySelector('h2')?.textContent?.trim()).toBe('Mari amintiri');
  });

  it('should map the size to a class', async () => {
    const { fixture, ribbon } = await setup();
    expect(ribbon.classList).toContain('ribbon--md');

    fixture.componentInstance.size.set('sm');
    await fixture.whenStable();

    expect(ribbon.classList).toContain('ribbon--sm');
    expect(ribbon.classList).not.toContain('ribbon--md');
  });

  it('should add decorative hearts on both sides only when decorated', async () => {
    const { fixture, ribbon } = await setup();
    expect(ribbon.querySelectorAll('app-icon').length).toBe(0);

    fixture.componentInstance.decorated.set(true);
    await fixture.whenStable();

    const hearts = Array.from(ribbon.querySelectorAll('app-icon'));
    expect(hearts.length).toBe(2);
    for (const heart of hearts) {
      expect(heart.getAttribute('aria-hidden')).toBe('true');
    }
    expect(ribbon.firstElementChild?.nextElementSibling).toBe(hearts[0]);
    expect(ribbon.lastElementChild).toBe(hearts[1]);
  });

  it('should hide the drawn band from assistive tech', async () => {
    const { ribbon } = await setup();

    expect(ribbon.querySelector('.ribbon__shape')?.getAttribute('aria-hidden')).toBe('true');
  });
});
