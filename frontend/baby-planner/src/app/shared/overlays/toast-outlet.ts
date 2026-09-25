import { Component, inject } from '@angular/core';

import { Button } from '../components/button/button';
import { Icon } from '../components/icon/icon';
import { IconName } from '../components/icon/icon-names';
import { ToastAction, ToastTone, ToastService } from './toast.service';

const TONE_ICON: Record<ToastTone, IconName> = {
  success: 'check',
  info: 'note',
  danger: 'alert',
};

/**
 * Locul unde apar toasturile: un singur exemplar, pus o data in shell-ul
 * aplicatiei (`app.html`, BP-UI-11). Nu fura niciodata focusul: anuntul catre
 * cititorul de ecran vine din `ToastService` (`LiveAnnouncer`), nu din acest
 * card vizual.
 */
@Component({
  selector: 'app-toast-outlet',
  imports: [Button, Icon],
  host: {
    class: 'toast-outlet',
    '(mouseenter)': 'onPointerEnter()',
    '(mouseleave)': 'onPointerLeave()',
    '(focusin)': 'onFocusIn()',
    '(focusout)': 'onFocusOut()',
  },
  template: `
    @if (toasts.current(); as toast) {
      <div class="toast" [attr.data-tone]="toast.tone">
        <app-icon class="toast__icon" [name]="toneIcon(toast.tone)" />
        <p class="toast__message">{{ toast.message }}</p>
        <div class="toast__actions">
          @if (toast.secondaryAction; as secondary) {
            <button appButton variant="ghost" type="button" (click)="run(toast.id, secondary)">
              {{ secondary.label }}
            </button>
          }
          @if (toast.action; as action) {
            <button appButton variant="ghost" type="button" (click)="run(toast.id, action)">
              {{ action.label }}
            </button>
          }
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      position: fixed;
      z-index: var(--z-toast);
      inset-inline: var(--space-4);
      /* Sub 64rem blocul ＋ ridicat din bara de jos iese ~24px deasupra ei,
         deci lasam un spatiu generos (--space-8), nu doar un rand de siguranta. */
      bottom: calc(var(--bottom-nav-height) + var(--space-8) + env(safe-area-inset-bottom, 0px));
      display: flex;
      justify-content: center;
    }

    @media (min-width: 64rem) {
      :host {
        inset-inline: var(--space-6);
        bottom: var(--space-6);
        justify-content: flex-end;
      }
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      width: 100%;
      max-width: 26rem;
      padding: var(--space-4);
      border-radius: var(--radius-lg);
      background-color: var(--color-surface);
      box-shadow: var(--shadow-lg);
      color: var(--color-text-strong);
      transition:
        transform var(--dur-fast) var(--ease-out),
        opacity var(--dur-fast) var(--ease-out);
    }

    @starting-style {
      .toast {
        transform: translateY(0.5rem);
        opacity: 0;
      }
    }

    .toast__icon {
      flex: none;
      margin-top: 0.125rem;
      color: var(--block-ink);
    }

    .toast__message {
      flex: 1;
      margin: 0;
      font-weight: 700;
    }

    .toast__actions {
      display: flex;
      flex: none;
      gap: var(--space-1);
    }
  `,
})
export class ToastOutlet {
  protected readonly toasts = inject(ToastService);

  private hovered = false;
  private focused = false;

  protected toneIcon(tone: ToastTone): IconName {
    return TONE_ICON[tone];
  }

  protected run(id: number, action: ToastAction): void {
    action.run();
    this.toasts.dismiss(id);
  }

  protected onPointerEnter(): void {
    this.hovered = true;
    this.toasts.pause();
  }

  protected onPointerLeave(): void {
    this.hovered = false;
    if (!this.focused) {
      this.toasts.resume();
    }
  }

  protected onFocusIn(): void {
    this.focused = true;
    this.toasts.pause();
  }

  protected onFocusOut(): void {
    this.focused = false;
    if (!this.hovered) {
      this.toasts.resume();
    }
  }
}
