import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Activity } from '../../../core/models/activity';
import { ActivityType, isActivityType } from '../../../core/models/activity-type';
import { ActiveBaby } from '../../../core/services/active-baby';
import { ActivityApi } from '../../../core/services/activity-api';
import { ActivityChanges } from '../../../core/services/activity-changes';
import { Clock } from '../../../core/services/clock';
import { QuickLogLauncher } from '../../../core/services/quick-log-launcher';
import { ActivityRow } from '../../../shared/components/activity-row/activity-row';
import { Button } from '../../../shared/components/button/button';
import { Card } from '../../../shared/components/card/card';
import { Divider } from '../../../shared/components/divider/divider';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { FilterChips } from '../../../shared/components/filter-chips/filter-chips';
import { Icon } from '../../../shared/components/icon/icon';
import { Ribbon } from '../../../shared/components/ribbon/ribbon';
import { Skeleton } from '../../../shared/components/skeleton/skeleton';
import { ageLabel } from '../../../shared/utils/ro-time';
import { SummaryTile } from '../summary-tile/summary-tile';
import { TYPE_COPY, groupByPartOfDay, newestFirst, summarizeToday } from '../today-summary';

// "joi, 25 septembrie": ziua saptamanii ajuta noaptea, cand zilele se amesteca.
const DATE_FORMATTER = new Intl.DateTimeFormat('ro', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

const NO_IDS: ReadonlySet<number> = new Set();

/** Ultima lista primita, pentru ce bebelus era si ce randuri au aparut fata de lista dinainte. */
interface LoadedDay {
  readonly babyId: number | undefined;
  readonly list: readonly Activity[];
  readonly fresh: ReadonlySet<number>;
}

/**
 * Pagina Azi: a cui e ziua, cand s-a intamplat ultima data fiecare lucru si
 * activitatile de azi in ordine, cu notarea la o atingere distanta.
 *
 * Datele vin intr-o singura cerere nefiltrata (`/activities/today`); filtrul
 * `?type=` se aplica local. Dalele au nevoie oricum de toate tipurile, iar o
 * zi are cateva zeci de randuri — schimbarea filtrului e instantanee, fara
 * o a doua cerere si fara sa clipeasca pagina la 3 noaptea.
 */
@Component({
  selector: 'app-dashboard-page',
  imports: [
    ActivityRow,
    Button,
    Card,
    Divider,
    EmptyState,
    ErrorState,
    FilterChips,
    Icon,
    Ribbon,
    RouterLink,
    Skeleton,
    SummaryTile,
  ],
  styleUrl: './dashboard-page.scss',
  templateUrl: './dashboard-page.html',
})
export class DashboardPage {
  private readonly activeBaby = inject(ActiveBaby);
  private readonly activityApi = inject(ActivityApi);
  private readonly changes = inject(ActivityChanges);
  private readonly clock = inject(Clock);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly launcher = inject(QuickLogLauncher);

  /**
   * Query param-ul `type` (prin `withComponentInputBinding`). Orice text care nu
   * e un tip cunoscut inseamna "fara filtru", ca un `?type=ceva` sa nu strice pagina.
   */
  readonly type = input<ActivityType | undefined, string | undefined>(undefined, {
    transform: (value) => (isActivityType(value) ? value : undefined),
  });

  protected readonly now = this.clock.now;

  // ActiveBaby.babies() arunca atunci cand lista n-a putut fi incarcata, deci
  // verificam eroarea inainte sa citim orice altceva din serviciu.
  protected readonly babiesError = computed(() => this.activeBaby.error());
  protected readonly hasBabies = computed(() =>
    this.babiesError() ? undefined : this.activeBaby.hasBabies(),
  );
  protected readonly baby = computed(() =>
    this.babiesError() ? undefined : this.activeBaby.activeBaby(),
  );
  private readonly babyId = computed(() => this.baby()?.id);

  protected readonly age = computed(() => {
    const baby = this.baby();
    return baby ? ageLabel(baby.dateOfBirth, this.clock.today()) : '';
  });

  protected readonly dateLabel = computed(() => DATE_FORMATTER.format(this.clock.today()));
  protected readonly dateValue = computed(() => {
    const today = this.clock.today();
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  });

  // Un numar, nu un Date: Clock.today() da un obiect nou la fiecare minut, iar
  // un obiect nou in `params` ar reface cererea din minut in minut.
  private readonly dayKey = computed(() => this.clock.today().getTime());

  /**
   * `version()` reface cererea dupa orice salvare/stergere din foaia de notare;
   * `dayKey()` o reface la miezul noptii, ca "Azi" sa nu ramana pe ziua de ieri.
   */
  protected readonly today = rxResource({
    params: () => {
      const babyId = this.babyId();
      return babyId === undefined
        ? undefined
        : { babyId, day: this.dayKey(), version: this.changes.version() };
    },
    stream: ({ params }) => this.activityApi.getToday(params.babyId),
  });

  /**
   * La o reincarcare, resursa isi goleste valoarea. Pastram ultima lista (pentru
   * acelasi bebelus) ca pagina sa nu clipeasca: continutul vechi doar se
   * estompeaza pe loc pana vine raspunsul. Tot aici aflam ce randuri sunt noi,
   * ca sa "cada" in cronologie.
   */
  private readonly loaded = linkedSignal<
    { babyId: number | undefined; list: readonly Activity[] | undefined },
    LoadedDay | undefined
  >({
    source: () => ({
      babyId: this.babyId(),
      list: this.today.hasValue() ? this.today.value() : undefined,
    }),
    computation: (source, previous) => {
      const prev = previous?.value;
      const sameBaby = prev !== undefined && prev.babyId === source.babyId;
      if (!source.list) {
        return sameBaby ? prev : undefined;
      }
      if (!sameBaby) {
        return { babyId: source.babyId, list: source.list, fresh: NO_IDS };
      }
      const known = new Set(prev.list.map((activity) => activity.id));
      const fresh = new Set(
        source.list.filter((activity) => !known.has(activity.id)).map((activity) => activity.id),
      );
      return { babyId: source.babyId, list: source.list, fresh };
    },
  });

  protected readonly activities = computed(() => this.loaded()?.list);
  protected readonly fresh = computed(() => this.loaded()?.fresh ?? NO_IDS);
  protected readonly isStale = computed(
    () => this.today.isLoading() && this.activities() !== undefined,
  );

  protected readonly summaries = computed(() => summarizeToday(this.activities() ?? []));

  protected readonly visible = computed(() => {
    const type = this.type();
    const list = this.activities() ?? [];
    return newestFirst(type ? list.filter((activity) => activity.type === type) : list);
  });

  protected readonly groups = computed(() => groupByPartOfDay(this.visible()));

  protected readonly filteredEmpty = computed(() => {
    const type = this.type();
    return type ? TYPE_COPY[type] : undefined;
  });

  /** Filtrul sta in URL: refresh-ul il pastreaza, iar Back revine la cel anterior. */
  protected setFilter(type: ActivityType | undefined): void {
    if (type === this.type()) {
      return;
    }
    void this.router.navigate([], {
      relativeTo: this.route,
      // `null` scoate parametrul din adresa, in loc sa lase un "?type=" gol.
      queryParams: { type: type ?? null },
      queryParamsHandling: 'merge',
      // Aceeasi pagina: schimbarea filtrului nu trebuie sa sara in capul paginii.
      scroll: 'manual',
    });
  }

  /** A doua apasare pe dala filtrului activ il scoate. */
  protected toggleFilter(type: ActivityType): void {
    this.setFilter(this.type() === type ? undefined : type);
  }

  protected reloadBabies(): void {
    this.activeBaby.reload();
  }
}
