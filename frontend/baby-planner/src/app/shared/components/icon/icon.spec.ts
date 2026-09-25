import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Icon } from './icon';
import { IconName } from './icon-names';

@Component({
  imports: [Icon],
  template: `<app-icon [name]="name" [label]="label" [size]="size" />`,
})
class TestHost {
  name: IconName = 'feeding';
  label: string | undefined;
  size: number | string | undefined;
}

describe('Icon', () => {
  it('is decorative (aria-hidden, no role) when it has no label', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('app-icon') as HTMLElement;
    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(host.getAttribute('role')).toBeNull();
    expect(host.hasAttribute('aria-label')).toBe(false);
  });

  it('becomes an accessible image when it has a label', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.label = 'Închide';
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('app-icon') as HTMLElement;
    expect(host.getAttribute('role')).toBe('img');
    expect(host.getAttribute('aria-label')).toBe('Închide');
    expect(host.hasAttribute('aria-hidden')).toBe(false);
  });

  it('points the <use> href at the requested symbol in the sprite', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.name = 'star';
    fixture.detectChanges();

    const use = fixture.nativeElement.querySelector('use') as SVGUseElement;
    expect(use.getAttribute('href')).toBe('icons/sprite.svg#star');
  });

  it('applies the requested size as a CSS custom property', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.size = 32;
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('app-icon') as HTMLElement;
    expect(host.style.getPropertyValue('--icon-size')).toBe('32px');
  });
});
