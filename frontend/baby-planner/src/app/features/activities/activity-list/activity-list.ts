import { DatePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import {
  ACTIVITY_TYPES,
  ACTIVITY_TYPE_LABELS,
  ActivityType,
  isActivityType,
} from '../../../core/models/activity-type';
import { ActivityApi } from '../../../core/services/activity-api';
import { BabyApi } from '../../../core/services/baby-api';

/**
 * Activitatile unui bebelus, cu filtrare dupa tip.
 *
 * Amandoua intrarile vin din URL prin `withComponentInputBinding()`:
 * `babyId` din segmentul de ruta, `type` din query string. Filtrul sta deci in
 * adresa, nu doar in memoria componentei — linkul e partajabil, iar butonul
 * Back al browserului se intoarce la filtrul anterior.
 */
@Component({
  selector: 'app-activity-list',
  imports: [DatePipe, RouterLink],
  styleUrl: './activity-list.scss',
  templateUrl: './activity-list.html',
})
export class ActivityList {
  private readonly activityApi = inject(ActivityApi);
  private readonly babyApi = inject(BabyApi);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly babyId = input.required<string>();

  /**
   * Query param-ul `type`. Transformarea filtreaza orice text care nu e un tip
   * cunoscut, ca un `?type=ceva` scris de mana sa nu ajunga la API.
   */
  readonly type = input<ActivityType | undefined, string | undefined>(undefined, {
    transform: (value) => (isActivityType(value) ? value : undefined),
  });

  protected readonly activityTypes = ACTIVITY_TYPES;
  protected readonly typeLabels = ACTIVITY_TYPE_LABELS;

  // Segmentele de ruta sunt mereu text; API-ul asteapta un numar.
  private readonly babyKey = computed(() => Number(this.babyId()));

  /** Doar ca sa putem scrie numele bebelusului in titlu, nu id-ul lui. */
  protected readonly baby = rxResource({
    params: () => this.babyKey(),
    stream: ({ params }) => this.babyApi.getById(params),
  });

  /**
   * `params` face resursa reactiva: la fiecare schimbare de bebelus sau de filtru,
   * Angular reface automat cererea. Nu apelam noi nimic la schimbarea filtrului.
   */
  protected readonly activities = rxResource({
    params: () => ({ babyId: this.babyKey(), type: this.type() }),
    stream: ({ params }) => this.activityApi.getForBaby(params.babyId, params.type),
    defaultValue: [],
  });

  /** Schimbarea filtrului inseamna o navigare: singura sursa de adevar e URL-ul. */
  protected onTypeChange(value: string): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      // `null` scoate parametrul din adresa, in loc sa lase un "?type=" gol.
      queryParams: { type: isActivityType(value) ? value : null },
      queryParamsHandling: 'merge',
    });
  }
}
