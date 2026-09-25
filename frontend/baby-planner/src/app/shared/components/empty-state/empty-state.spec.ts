import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { EmptyState } from './empty-state';

@Component({
  selector: 'app-host',
  imports: [EmptyState],
  template: `
    <app-empty-state
      title="Nicio activitate azi."
      message="Apasă ＋ ca s-o adaugi pe prima."
      [framed]="framed()"
    >
      <button actions type="button">Adaugă</button>
    </app-empty-state>
  `,
})
class Host {
  readonly framed = signal(false);
}

describe('EmptyState', () => {
  it('renders the title as a heading and the message', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const heading = fixture.nativeElement.querySelector('h2');
    expect(heading?.textContent).toContain('Nicio activitate azi.');
    expect(fixture.nativeElement.textContent).toContain('Apasă ＋ ca s-o adaugi pe prima.');
  });

  it('projects the actions slot', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[actions]')?.textContent).toContain('Adaugă');
  });

  it('adds the framed surface only when asked', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('app-empty-state');
    expect(host.classList).not.toContain('empty-state--framed');

    fixture.componentInstance.framed.set(true);
    fixture.detectChanges();

    expect(host.classList).toContain('empty-state--framed');
  });
});
