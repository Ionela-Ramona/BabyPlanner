import { Service, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Activity } from '../models/activity';
import { ActivityType } from '../models/activity-type';
import { SheetService } from '../../shared/overlays/sheet.service';
import { ActiveBaby } from './active-baby';

/**
 * Cum se deschide foaia:
 * - `quick`: cuburile de tip; o apasare salveaza "acum" si inchide foaia (2 atingeri);
 * - `details`: formularul intreg (tip, cand, notite) pentru o activitate noua;
 * - `edit`: acelasi formular, completat, cu "Șterge" in subsol.
 */
export type QuickLogMode = 'quick' | 'details' | 'edit';

/** Ce primeste foaia de logare rapida prin `DIALOG_DATA`. */
export interface QuickLogData {
  readonly mode: QuickLogMode;
  readonly babyId: number;
  readonly babyName: string;
  /** Tipul ales dinainte (ex. din "Încă o masă" pe Azi); lipsa = parintele alege. */
  readonly type?: ActivityType;
  /** Doar in modul `edit`. */
  readonly activity?: Activity;
}

/**
 * Un singur loc care deschide foaia "＋ Adaugă", indiferent de unde apesi: bara de
 * jos, rail-ul de pe desktop, un rand din cronologie sau un buton de pe Azi.
 *
 * Foaia se incarca lazy (`import()`): codul ei nu intra in bundle-ul initial,
 * ajunge in browser abia la prima apasare.
 */
@Service()
export class QuickLogLauncher {
  private readonly sheets = inject(SheetService);
  private readonly activeBaby = inject(ActiveBaby);
  private readonly router = inject(Router);

  /** Foaia rapida (cuburi). Cu `type`, sare direct la formularul cu tipul ales. */
  open(type?: ActivityType): Promise<void> {
    return this.show(type ? 'details' : 'quick', { type });
  }

  /** Formularul intreg pentru o activitate noua. */
  openDetails(type?: ActivityType): Promise<void> {
    return this.show('details', { type });
  }

  /** Editarea unei activitati existente (tap pe un rand din Azi / Istoric). */
  edit(activity: Activity): Promise<void> {
    return this.show('edit', { type: activity.type, activity }, activity.babyId);
  }

  private async show(
    mode: QuickLogMode,
    extra: Pick<QuickLogData, 'type' | 'activity'>,
    babyId?: number,
  ): Promise<void> {
    const baby =
      babyId === undefined
        ? this.activeBaby.activeBaby()
        : this.activeBaby.babies().find((candidate) => candidate.id === babyId);
    if (!baby) {
      // Fara bebelus nu avem pentru cine nota; il trimitem pe pagina de bun venit sa adauge unul.
      await this.router.navigateByUrl('/welcome');
      return;
    }

    const { QuickLogSheet } = await import('../../features/quick-log/quick-log-sheet');
    this.sheets.open<unknown, QuickLogData>(QuickLogSheet, {
      data: { mode, babyId: baby.id, babyName: baby.name, ...extra },
      ariaLabelledBy: 'quick-log-title',
    });
  }
}
