import { DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';

import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { Icon } from '../../../shared/components/icon/icon';
import { Skeleton, SkeletonVariant } from '../../../shared/components/skeleton/skeleton';
import { ConfirmService } from '../../../shared/overlays/confirm.service';
import { SheetFooter } from '../../../shared/overlays/sheet-footer';
import { SheetHeader } from '../../../shared/overlays/sheet-header';
import { SheetService } from '../../../shared/overlays/sheet.service';
import { ToastService } from '../../../shared/overlays/toast.service';

/**
 * Continutul foii de test deschise de vitrina: antet cu titlu si subtitlu,
 * putin text si un subsol cu actiuni. Foloseste `app-sheet-header` /
 * `app-sheet-footer`, exact ca o foaie reala construita peste `SheetService`.
 */
@Component({
  selector: 'app-demo-sheet',
  imports: [SheetHeader, SheetFooter, Button],
  template: `
    <app-sheet-header title="Adaugă o masă" subtitle="Maria · azi" (close)="dialogRef.close()" />
    <p>Alege ora și, dacă vrei, adaugă o notiță.</p>
    <p class="text-muted">
      Se închide cu Esc, cu clic în afara ei sau cu butoanele de mai jos — focusul se întoarce pe butonul care a
      deschis-o.
    </p>
    <app-sheet-footer>
      <button appButton variant="secondary" type="button" (click)="dialogRef.close()">Anulează</button>
      <button appButton variant="primary" type="button" (click)="dialogRef.close()">Salvează</button>
    </app-sheet-footer>
  `,
})
export class DemoSheet {
  protected readonly dialogRef = inject<DialogRef<void, DemoSheet>>(DialogRef);
}

/** Sectiunea "Foi, confirmări, notificări, stări" din vitrina (BP-UI-10). */
@Component({
  selector: 'app-feedback-section',
  imports: [Button, Icon, Skeleton, EmptyState, ErrorState],
  template: `
    <section class="showcase-section">
      <h3>Foi, confirmări, notificări, stări</h3>

      <div class="demo-group">
        <h4>Foaie (SheetService)</h4>
        <button appButton variant="secondary" type="button" (click)="openSheet()">Deschide foaia</button>
      </div>

      <div class="demo-group">
        <h4>Confirmare (ConfirmService)</h4>
        <button appButton variant="danger" type="button" (click)="confirmDelete()">Șterge bebelușul</button>
      </div>

      <div class="demo-group">
        <h4>Toasturi (ToastService)</h4>
        <div class="demo-row">
          <button appButton variant="secondary" type="button" (click)="showSuccessToast()">Toast succes</button>
          <button appButton variant="secondary" type="button" (click)="showDangerToast()">Toast eroare</button>
        </div>
        <p class="text-muted">
          Toasturile apar în <code>&lt;app-toast-outlet /&gt;</code> din shell-ul aplicației (colțul din dreapta
          jos pe desktop, deasupra barei de jos pe telefon).
        </p>
      </div>

      <div class="demo-group">
        <h4>Schelete (app-skeleton)</h4>
        @for (variant of skeletonVariants; track variant) {
          <div class="demo-row">
            <span class="demo-label">{{ variant }}</span>
            <app-skeleton [variant]="variant" [count]="variant === 'text' ? 3 : variant === 'tile' ? 3 : 1" />
          </div>
        }
      </div>

      <div class="demo-group">
        <h4>Stare goală (app-empty-state)</h4>
        <app-empty-state
          title="Nicio activitate azi."
          message="Apasă ＋ ca s-o adaugi pe prima."
          illustration="sleepy-star.svg"
          framed
        >
          <button actions appButton variant="primary" type="button">
            <app-icon name="plus" />
            Adaugă activitate
          </button>
        </app-empty-state>
      </div>

      <div class="demo-group">
        <h4>Stare de eroare (app-error-state)</h4>
        <app-error-state message="Nu am putut încărca activitățile." (retry)="retryError()" />
      </div>
    </section>
  `,
  styles: `
    .demo-group {
      display: grid;
      gap: var(--space-3);
      margin-bottom: var(--space-6);
    }

    h4 {
      margin: 0;
      font-family: var(--font-display);
      font-size: var(--text-lead);
      font-weight: 500;
    }

    .demo-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-3);
    }

    .demo-label {
      min-width: 5rem;
      color: var(--color-text-muted);
      font-size: var(--text-small);
    }
  `,
})
export class FeedbackSection {
  private readonly sheets = inject(SheetService);
  private readonly confirms = inject(ConfirmService);
  private readonly toasts = inject(ToastService);

  protected readonly skeletonVariants: SkeletonVariant[] = ['row', 'tile', 'baby-card', 'profile', 'text'];

  protected openSheet(): void {
    this.sheets.open(DemoSheet, { title: 'Adaugă o masă' });
  }

  protected async confirmDelete(): Promise<void> {
    const confirmed = await this.confirms.confirm({
      title: 'Ștergi bebelușul Maria și toate activitățile?',
      message: 'Nu poți anula această acțiune.',
      confirmLabel: 'Șterge',
    });
    this.toasts.show({
      message: confirmed ? 'Bebelușul a fost șters.' : 'Ștergerea a fost anulată.',
      tone: confirmed ? 'danger' : 'info',
    });
  }

  protected showSuccessToast(): void {
    this.toasts.show({
      message: 'Masă înregistrată',
      tone: 'success',
      action: { label: 'Anulează', run: () => this.toasts.show({ message: 'Anulat.', tone: 'info' }) },
      secondaryAction: { label: 'Adaugă detalii', run: () => this.toasts.show({ message: 'Aici s-ar deschide detaliile.', tone: 'info' }) },
    });
  }

  protected showDangerToast(): void {
    this.toasts.show({ message: 'Nu am putut salva activitatea.', tone: 'danger' });
  }

  protected retryError(): void {
    this.toasts.show({ message: 'Se reîncearcă…', tone: 'info' });
  }
}
