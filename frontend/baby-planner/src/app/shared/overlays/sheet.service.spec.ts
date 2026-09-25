import { Dialog } from '@angular/cdk/dialog';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationRef, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SheetService } from './sheet.service';

@Component({
  selector: 'app-test-sheet',
  template: `<p>Conținut foaie</p>`,
})
class TestSheetContent {}

/** Simuleaza tasta Escape asa cum o citeste CDK: dupa `keyCode`, nu doar `key`. */
function dispatchEscape(): void {
  const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
  Object.defineProperty(event, 'keyCode', { value: 27 });
  document.body.dispatchEvent(event);
}

describe('SheetService', () => {
  let service: SheetService;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SheetService);
    overlayContainer = TestBed.inject(OverlayContainer);
    overlayContainerElement = overlayContainer.getContainerElement();
  });

  afterEach(() => {
    TestBed.inject(Dialog).closeAll();
    overlayContainer.ngOnDestroy();
  });

  it('opens the given component inside the overlay', () => {
    service.open(TestSheetContent);

    expect(overlayContainerElement.textContent).toContain('Conținut foaie');
  });

  it('labels the sheet with the given title', async () => {
    service.open(TestSheetContent, { title: 'Adaugă activitate' });
    await TestBed.inject(ApplicationRef).whenStable();

    const dialog = overlayContainerElement.querySelector('[role="dialog"]');
    expect(dialog?.getAttribute('aria-label')).toBe('Adaugă activitate');
  });

  it('prefers an explicit ariaLabelledBy over the title', async () => {
    service.open(TestSheetContent, { title: 'Ignorat', ariaLabelledBy: 'my-heading' });
    await TestBed.inject(ApplicationRef).whenStable();

    const dialog = overlayContainerElement.querySelector('[role="dialog"]');
    expect(dialog?.getAttribute('aria-label')).toBeNull();
    expect(dialog?.getAttribute('aria-labelledby')).toBe('my-heading');
  });

  it('traps focus inside the sheet', async () => {
    service.open(TestSheetContent);
    await TestBed.inject(ApplicationRef).whenStable();

    const dialog = overlayContainerElement.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('closes on Escape and restores focus to the trigger', async () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();

    service.open(TestSheetContent);
    await TestBed.inject(ApplicationRef).whenStable();
    expect(overlayContainerElement.querySelector('[role="dialog"]')).toBeTruthy();

    dispatchEscape();

    expect(overlayContainerElement.querySelector('[role="dialog"]')).toBeFalsy();
    expect(document.activeElement).toBe(trigger);

    trigger.remove();
  });

  it('resolves the closed observable with the result passed to close()', () => {
    const ref = service.open<TestSheetContent, unknown, string>(TestSheetContent);
    const results: (string | undefined)[] = [];
    ref.closed.subscribe((value) => results.push(value));

    ref.close('salvat');

    expect(results).toEqual(['salvat']);
  });
});
