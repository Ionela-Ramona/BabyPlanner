import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Bubble, BubbleAlign } from './bubble';

@Component({
  imports: [Bubble],
  template: `
    <app-bubble [scriptLine]="scriptLine()" [align]="align()">
      <p>Ești cea mai mare aventură a noastră</p>
    </app-bubble>
  `,
})
class Host {
  readonly scriptLine = signal<string | undefined>(undefined);
  readonly align = signal<BubbleAlign>('center');
}

describe('Bubble', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    return { fixture, bubble: root.querySelector('app-bubble') as HTMLElement };
  }

  it('should project its content as real text', async () => {
    const { bubble } = await setup();

    expect(bubble.querySelector('p')?.textContent).toBe('Ești cea mai mare aventură a noastră');
  });

  it('should render the script line only when one is given', async () => {
    const { fixture, bubble } = await setup();
    expect(bubble.querySelector('.script')).toBeNull();

    fixture.componentInstance.scriptLine.set('Maria');
    await fixture.whenStable();

    const script = bubble.querySelector('.script');
    expect(script?.textContent?.trim()).toBe('Maria');
    expect(script?.classList).toContain('bubble__script');
  });

  it('should map the alignment to a class', async () => {
    const { fixture, bubble } = await setup();
    expect(bubble.classList).toContain('bubble--center');

    fixture.componentInstance.align.set('start');
    await fixture.whenStable();

    expect(bubble.classList).toContain('bubble--start');
    expect(bubble.classList).not.toContain('bubble--center');
  });

  it('should draw the cloud and its stitch as decoration', async () => {
    const { bubble } = await setup();
    const svgs = Array.from(bubble.querySelectorAll('svg'));

    expect(svgs.length).toBe(2);
    for (const svg of svgs) {
      expect(svg.getAttribute('aria-hidden')).toBe('true');
    }
    expect(bubble.querySelector('.bubble__fill path')?.getAttribute('d')).toMatch(/^M.+Z$/);
    expect(bubble.querySelector('.bubble__stitch path')?.getAttribute('stroke-dasharray')).toMatch(
      /^[\d.]+ [\d.]+$/,
    );
  });
});
