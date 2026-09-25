import { Dialog } from '@angular/cdk/dialog';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ConfirmService } from './confirm.service';

describe('ConfirmService', () => {
  let service: ConfirmService;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfirmService);
    overlayContainer = TestBed.inject(OverlayContainer);
    overlayContainerElement = overlayContainer.getContainerElement();
  });

  afterEach(() => {
    TestBed.inject(Dialog).closeAll();
    overlayContainer.ngOnDestroy();
  });

  it('resolves true when the confirm button is pressed', async () => {
    const pending = service.confirm({
      title: 'Ștergi bebelușul Maria și toate activitățile?',
      message: 'Nu poți anula această acțiune.',
      confirmLabel: 'Șterge',
    });
    await TestBed.inject(ApplicationRef).whenStable();

    const dialog = overlayContainerElement.querySelector('[role="alertdialog"]') as HTMLElement;
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-label')).toBe('Ștergi bebelușul Maria și toate activitățile?');

    const confirmButton = Array.from(dialog.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Șterge'),
    ) as HTMLButtonElement;
    confirmButton.click();

    expect(await pending).toBe(true);
  });

  it('resolves false when cancelled, and focuses Cancel by default', async () => {
    const pending = service.confirm({
      title: 'Ștergi activitatea?',
      message: 'Nu poți anula această acțiune.',
      confirmLabel: 'Șterge',
    });
    await TestBed.inject(ApplicationRef).whenStable();

    const cancelButton = overlayContainerElement.querySelector('[data-confirm-cancel]') as HTMLButtonElement;
    expect(document.activeElement).toBe(cancelButton);

    cancelButton.click();

    expect(await pending).toBe(false);
  });

  it('resolves false when dismissed without a result (e.g. Escape)', async () => {
    const pending = service.confirm({
      title: 'Ștergi activitatea?',
      message: 'Nu poți anula această acțiune.',
      confirmLabel: 'Șterge',
    });

    TestBed.inject(Dialog).closeAll();

    expect(await pending).toBe(false);
  });
});
