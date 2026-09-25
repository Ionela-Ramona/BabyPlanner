import { Component, computed, effect, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Activity } from '../../../core/models/activity';
import { ActivityType, isActivityType } from '../../../core/models/activity-type';
import { ActiveBaby } from '../../../core/services/active-baby';
import { ActivityApi } from '../../../core/services/activity-api';
import { ActivityChanges } from '../../../core/services/activity-changes';
import { BabyApi } from '../../../core/services/baby-api';
import { Clock } from '../../../core/services/clock';
import { QuickLogLauncher } from '../../../core/services/quick-log-launcher';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { Button } from '../../../shared/components/button/button';
import { Card } from '../../../shared/components/card/card';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { FilterChips } from '../../../shared/components/filter-chips/filter-chips';
import { Icon } from '../../../shared/components/icon/icon';
import { ActivityRow } from '../../../shared/components/activity-row/activity-row';
import { Ribbon } from '../../../shared/components/ribbon/ribbon';
import { Skeleton } from '../../../shared/components/skeleton/skeleton';
import { ACTIVITY_NOUN, countLabel, dayHeader } from '../../../shared/utils/ro-time';

/** Un grup de activitati care s-au petrecut in aceeasi zi calendaristica locala. */
interface DayGroup {
  /** Cheie stabila pentru `track`, nu textul afisat (doua zile diferite din ani diferiti pot avea acelasi titlu). */
  readonly key: string;
  readonly heading: string;
  readonly summary: string;
  readonly activities: readonly Activity[];
}

/**
 * Mesajul starii goale filtrate ("Niciun X înregistrat"), cu genul corect pentru
 * fiecare substantiv — "Nicio masă", dar "Niciun somn". `ACTIVITY_NOUN` din
 * ro-time.ts nu tine genul, deci propozitiile complete stau aici, langa singurul
 * loc care le foloseste.
 */
const EMPTY_TYPE_MESSAGE: Readonly<Record<ActivityType, string>> = {
  Feeding: 'Nicio masă înregistrată',
  Sleep: 'Niciun somn înregistrat',
  Diaper: 'Niciun scutec înregistrat',
  Medicine: 'Niciun medicament înregistrat',
  Other: 'Nicio activitate înregistrată',
};

/** Cheia de grupare: anul, luna si ziua locale, ca sa nu depindem de formatarea textului afisat. */
function localDayKey(instant: string): string {
  const date = new Date(instant);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/** "3 mese · 2 scutece · 1 somn": un tip pe substantivul lui, ordonat descrescator dupa numar. */
function summarizeDay(activities: readonly Activity[]): string {
  const counts = new Map<ActivityType, number>();
  for (const activity of activities) {
    counts.set(activity.type, (counts.get(activity.type) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([type, count]) => countLabel(count, ACTIVITY_NOUN[type]))
    .join(' · ');
}

/**
 * Istoricul activitatilor unui bebelus, grupat pe zi, cu filtrare dupa tip.
 *
 * Amandoua intrarile vin din URL prin `withComponentInputBinding()`:
 * `babyId` din segmentul de ruta, `type` din query string. Filtrul sta deci in
 * adresa, nu doar in memoria componentei — linkul e partajabil, iar butonul
 * Back al browserului se intoarce la filtrul anterior.
 */
@Component({
  selector: 'app-activity-list',
  imports: [
    RouterLink,
    Avatar,
    Button,
    Card,
    EmptyState,
    ErrorState,
    FilterChips,
    Icon,
    ActivityRow,
    Ribbon,
    Skeleton,
  ],
  styleUrl: './activity-list.scss',
  templateUrl: './activity-list.html',
})
export class ActivityList {
  private readonly activityApi = inject(ActivityApi);
  private readonly babyApi = inject(BabyApi);
  private readonly activityChanges = inject(ActivityChanges);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly activeBaby = inject(ActiveBaby);
  protected readonly clock = inject(Clock);
  protected readonly launcher = inject(QuickLogLauncher);

  readonly babyId = input.required<string>();

  /**
   * Query param-ul `type`. Transformarea filtreaza orice text care nu e un tip
   * cunoscut, ca un `?type=ceva` scris de mana sa nu ajunga la API.
   */
  readonly type = input<ActivityType | undefined, string | undefined>(undefined, {
    transform: (value) => (isActivityType(value) ? value : undefined),
  });

  protected readonly emptyTypeMessage = computed(() => {
    const type = this.type();
    return type ? EMPTY_TYPE_MESSAGE[type] : '';
  });

  // Segmentele de ruta sunt mereu text; API-ul asteapta un numar.
  private readonly babyKey = computed(() => Number(this.babyId()));

  /** Bebelusul din lista globala, daca a incarcat deja — sursa de adevar pentru switcher si nav. */
  protected readonly baby = computed(() =>
    this.activeBaby.babies().find((candidate) => candidate.id === this.babyKey()),
  );

  /**
   * Doar cand bebelusul nu e (inca) in lista globala — de exemplu un link direct
   * deschis inainte ca `ActiveBaby` sa fi terminat prima incarcare.
   */
  protected readonly babyFallback = rxResource({
    params: () => (this.baby() || this.activeBaby.isLoading() ? undefined : this.babyKey()),
    stream: ({ params }) => this.babyApi.getById(params),
  });

  protected readonly babyName = computed(() => this.baby()?.name ?? this.babyFallback.value()?.name);

  /**
   * `params` face resursa reactiva: la fiecare schimbare de bebelus, filtru sau
   * mutatie (creare/editare/stergere din foaia rapida), Angular reface automat
   * cererea — nu apelam noi nimic manual.
   */
  protected readonly activities = rxResource({
    params: () => ({
      babyId: this.babyKey(),
      type: this.type(),
      version: this.activityChanges.version(),
    }),
    stream: ({ params }) => this.activityApi.getForBaby(params.babyId, params.type),
    defaultValue: [],
  });

  /**
   * Activitatile grupate pe zi calendaristica locala, cele mai noi zile intai.
   * API-ul intoarce lista deja sortata descrescator dupa `occurredAt`; sortam
   * din nou aici ca ordinea sa nu depinda de acel contract implicit.
   */
  protected readonly dayGroups = computed<readonly DayGroup[]>(() => {
    const today = this.clock.today();
    const sorted = [...this.activities.value()].sort(
      (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );

    const byDay = new Map<string, Activity[]>();
    for (const activity of sorted) {
      const key = localDayKey(activity.occurredAt);
      const bucket = byDay.get(key);
      if (bucket) {
        bucket.push(activity);
      } else {
        byDay.set(key, [activity]);
      }
    }

    return Array.from(byDay.entries()).map(([key, dayActivities]) => ({
      key,
      heading: dayHeader(dayActivities[0].occurredAt, today),
      summary: summarizeDay(dayActivities),
      activities: dayActivities,
    }));
  });

  constructor() {
    // Ruta cu :babyId trebuie sa devina si bebelusul activ, ca bara de sus si
    // navigarea de jos sa urmareasca pagina Istoric, nu doar continutul ei.
    effect(() => {
      const id = this.babyKey();
      if (Number.isFinite(id)) {
        this.activeBaby.select(id);
      }
    });
  }

  /** Schimbarea filtrului inseamna o navigare: singura sursa de adevar e URL-ul. */
  protected onTypeChange(value: ActivityType | undefined): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      // `null` scoate parametrul din adresa, in loc sa lase un "?type=" gol.
      queryParams: { type: value ?? null },
      queryParamsHandling: 'merge',
    });
  }

  protected clearFilter(): void {
    this.onTypeChange(undefined);
  }

  protected addFirstActivity(): void {
    void this.launcher.open();
  }
}
