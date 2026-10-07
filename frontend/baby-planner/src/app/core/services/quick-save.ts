import { Service, inject } from '@angular/core';

import { CreateActivityRequest } from '../models/activity';
import { ACTIVITY_META, ActivityType } from '../models/activity-type';
import { ToastService } from '../../shared/overlays/toast.service';
import { ActivityLog } from './activity-log';
import { Clock } from './clock';
import { QuickLogLauncher } from './quick-log-launcher';

export const SAVE_FAILED = 'Nu am putut salva. Verifică conexiunea și încearcă din nou.';
export const UNDO_FAILED = 'Nu am putut anula. Verifică conexiunea și încearcă din nou.';

/**
 * Notarea "acum", la o singura atingere: cubul din foaia ＋ Adaugă si dalele de pe Azi.
 *
 * Nu asteapta raspunsul ca sa lase parintele mai departe: salvarea pleaca in fundal,
 * iar toastul confirma, ofera "Anulează" (o atingere gresita se repara dintr-un gest)
 * si "Adaugă detalii". Somnul porneste "in desfasurare" si se incheie cu "S-a trezit".
 */
@Service()
export class QuickSave {
  private readonly activityLog = inject(ActivityLog);
  private readonly clock = inject(Clock);
  private readonly toasts = inject(ToastService);
  private readonly launcher = inject(QuickLogLauncher);

  save(babyId: number, type: ActivityType): void {
    this.send(babyId, {
      type,
      occurredAt: this.clock.now().toISOString(),
      notes: null,
      ...(type === 'Sleep' ? { inProgress: true } : {}),
    });
  }

  private send(babyId: number, request: CreateActivityRequest): void {
    this.activityLog.create(babyId, request).subscribe({
      next: (saved) =>
        this.toasts.show({
          message: saved.inProgress ? 'Somn început' : ACTIVITY_META[saved.type].copy.logged,
          tone: 'success',
          action: {
            label: 'Anulează',
            run: () =>
              this.activityLog.remove(babyId, saved).subscribe({
                next: () => this.toasts.show({ message: 'Am anulat.', tone: 'info' }),
                error: () => this.toasts.show({ message: UNDO_FAILED, tone: 'danger' }),
              }),
          },
          secondaryAction: { label: 'Adaugă detalii', run: () => void this.launcher.edit(saved) },
        }),
      error: () =>
        this.toasts.show({
          message: SAVE_FAILED,
          tone: 'danger',
          // Acelasi moment ca la prima incercare, nu "acum"-ul reincercarii.
          action: { label: 'Încearcă din nou', run: () => this.send(babyId, request) },
        }),
    });
  }
}
