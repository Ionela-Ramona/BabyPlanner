import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Skeleton } from './skeleton';

@Component({
  selector: 'app-host',
  imports: [Skeleton],
  template: `<app-skeleton [variant]="variant" [count]="count" />`,
})
class Host {
  variant: 'row' | 'tile' | 'baby-card' | 'profile' | 'text' = 'row';
  count = 1;
}

describe('Skeleton', () => {
  it('exposes a status role with a visually hidden loading label', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const status = fixture.nativeElement.querySelector('app-skeleton');
    expect(status.getAttribute('role')).toBe('status');
    expect(status.textContent).toContain('Se încarcă…');
  });

  it('renders one shape per count', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.count = 3;
    fixture.detectChanges();

    const shapes = fixture.nativeElement.querySelectorAll('.skeleton__shape');
    expect(shapes.length).toBe(3);
  });

  it('renders the composite profile shape', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.variant = 'profile';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.skeleton__profile')).toBeTruthy();
  });
});
