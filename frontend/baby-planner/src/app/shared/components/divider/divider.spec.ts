import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Divider, DividerVariant } from './divider';

@Component({
  imports: [Divider],
  template: `<app-divider [variant]="variant">{{ label }}</app-divider>`,
})
class TestHost {
  variant: DividerVariant = 'stitch';
  label = '';
}

describe('Divider', () => {
  it('defaults to the stitch variant and stays decorative without a label', async () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    await fixture.whenStable();

    const host = fixture.nativeElement.querySelector('app-divider') as HTMLElement;
    expect(host.classList).toContain('divider--stitch');
    expect(host.classList).not.toContain('divider--labeled');
    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(host.getAttribute('role')).toBeNull();
  });

  it('renders the line variant', async () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.variant = 'line';
    fixture.detectChanges();
    await fixture.whenStable();

    const host = fixture.nativeElement.querySelector('app-divider') as HTMLElement;
    expect(host.classList).toContain('divider--line');
  });

  it('becomes a semantic separator with a visible label when content is projected', async () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.label = 'Dimineața';
    fixture.detectChanges();
    await fixture.whenStable();

    const host = fixture.nativeElement.querySelector('app-divider') as HTMLElement;
    expect(host.classList).toContain('divider--labeled');
    expect(host.getAttribute('role')).toBe('separator');
    expect(host.getAttribute('aria-hidden')).toBeNull();
    expect(host.querySelector('.divider__label')?.textContent).toBe('Dimineața');
  });
});
