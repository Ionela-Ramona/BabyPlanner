import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Frame, FrameShape } from './frame';

@Component({
  imports: [Frame],
  template: `
    <app-frame [shape]="shape()" [size]="size()" [tone]="tone()">M</app-frame>
    <app-frame shape="circle" [size]="96">
      <img src="photo.png" width="10" height="10" alt="Maria la o lună" />
    </app-frame>
  `,
})
class Host {
  readonly shape = signal<FrameShape>('cloud');
  readonly size = signal<number | string>(200);
  readonly tone = signal<string | undefined>('feeding');
}

describe('Frame', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const frame = root.querySelector('app-frame') as HTMLElement;
    return { fixture, root, frame };
  }

  it('should default to the cloud shape and mask the content with the scallop outline', async () => {
    const { frame } = await setup();

    expect(frame.classList).toContain('frame--cloud');
    const content = frame.querySelector('.frame__content') as HTMLElement;
    expect(content.style.maskImage).toContain('data:image/svg+xml');
  });

  it('should map the shape to a class and clip circles with a radius instead of a mask', async () => {
    const { fixture, frame } = await setup();
    fixture.componentInstance.shape.set('circle');
    await fixture.whenStable();

    expect(frame.classList).toContain('frame--circle');
    expect(frame.classList).not.toContain('frame--cloud');
    expect((frame.querySelector('.frame__content') as HTMLElement).style.maskImage).toBe('');
    expect(frame.style.getPropertyValue('--frame-radius')).toBe('50%');
  });

  it('should set the tone on the host only when one is given', async () => {
    const { fixture, frame } = await setup();
    expect(frame.getAttribute('data-tone')).toBe('feeding');

    fixture.componentInstance.tone.set(undefined);
    await fixture.whenStable();

    expect(frame.hasAttribute('data-tone')).toBe(false);
  });

  it('should size the host from a number or any CSS length', async () => {
    const { fixture, frame } = await setup();
    expect(frame.style.getPropertyValue('--frame-size')).toBe('200px');

    fixture.componentInstance.size.set('10rem');
    await fixture.whenStable();

    expect(frame.style.getPropertyValue('--frame-size')).toBe('10rem');
    expect(frame.style.getPropertyValue('--frame-px')).toBe('160px');
  });

  it('should draw a seamless stitch on large frames and drop it on small avatars', async () => {
    const { fixture, frame } = await setup();
    const stitch = frame.querySelector('.frame__stitch path');
    expect(stitch?.getAttribute('d')).toMatch(/^M.+Z$/);
    expect(stitch?.getAttribute('stroke-dasharray')).toMatch(/^[\d.]+ [\d.]+$/);
    expect(frame.classList).toContain('frame--stitched');

    fixture.componentInstance.size.set(48);
    await fixture.whenStable();

    expect(frame.querySelector('.frame__stitch')).toBeNull();
    expect(frame.classList).not.toContain('frame--stitched');
  });

  it('should project initials and images, keeping the drawn layers hidden from assistive tech', async () => {
    const { root, frame } = await setup();

    expect(frame.textContent?.trim()).toBe('M');
    expect(root.querySelector('img')?.getAttribute('alt')).toBe('Maria la o lună');
    for (const svg of Array.from(root.querySelectorAll('app-frame svg'))) {
      expect(svg.getAttribute('aria-hidden')).toBe('true');
    }
  });
});
