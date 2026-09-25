import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ErrorState } from './error-state';

@Component({
  selector: 'app-host',
  imports: [ErrorState],
  template: `<app-error-state message="Nu am putut încărca lista." (retry)="retried = true" />`,
})
class Host {
  retried = false;
}

describe('ErrorState', () => {
  it('has an alert role and the default title', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('app-error-state');
    expect(host.getAttribute('role')).toBe('alert');
    expect(host.textContent).toContain('Ceva n-a mers');
    expect(host.textContent).toContain('Nu am putut încărca lista.');
  });

  it('emits retry when the button is clicked', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.textContent).toContain('Reîncearcă');

    button.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.retried).toBe(true);
  });
});
