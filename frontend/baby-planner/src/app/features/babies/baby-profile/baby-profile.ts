import { NgOptimizedImage } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  Injector,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';

import { Activity } from '../../../core/models/activity';
import { ACTIVITY_META, ACTIVITY_TYPES, ActivityType } from '../../../core/models/activity-type';
import { Baby } from '../../../core/models/baby';
import { ActiveBaby } from '../../../core/services/active-baby';
import { ActivityApi } from '../../../core/services/activity-api';
import { ActivityChanges } from '../../../core/services/activity-changes';
import { BabyApi } from '../../../core/services/baby-api';
import { Clock } from '../../../core/services/clock';
import { Bubble } from '../../../shared/components/bubble/bubble';
import { Button } from '../../../shared/components/button/button';
import { Card } from '../../../shared/components/card/card';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { Frame } from '../../../shared/components/frame/frame';
import { Icon } from '../../../shared/components/icon/icon';
import { Ribbon } from '../../../shared/components/ribbon/ribbon';
import { Skeleton } from '../../../shared/components/skeleton/skeleton';
import { ConfirmService } from '../../../shared/overlays/confirm.service';
import { ToastService } from '../../../shared/overlays/toast.service';
import { ACTIVITY_NOUN, ageLabel, countLabel, relativeLabel } from '../../../shared/utils/ro-time';
import { birthDateLabel, initialsOf, reloadBabies } from '../baby-format';

/** "Ultima masă" / "Ultimul somn": momentul, gata de afisat. */
interface LastMoment {
  readonly iso: string;
  readonly relative: string;
}

/**
 * Profilul bebelusului: pagina "Little Moments" din imaginea de referinta,
 * construita doar din date reale (nume, data nasterii, activitatile de azi).
 * Inaltimea, greutatea si "Îi place" apar abia cand backendul le va avea.
 */
@Component({
  selector: 'app-baby-profile',
  imports: [
    Bubble,
    Button,
    Card,
    EmptyState,
    ErrorState,
    Frame,
    Icon,
    NgOptimizedImage,
    Ribbon,
    RouterLink,
    Skeleton,
  ],
  styleUrl: './baby-profile.scss',
  templateUrl: './baby-profile.html',
})
export class BabyProfile {
  private readonly babyApi = inject(BabyApi);
  private readonly activityApi = inject(ActivityApi);
  private readonly changes = inject(ActivityChanges);
  private readonly active = inject(ActiveBaby);
  private readonly clock = inject(Clock);
  private readonly confirm = inject(ConfirmService);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  /** Din ruta (`/babies/:babyId`), prin `withComponentInputBinding`. */
  readonly babyId = input.required<string>();

  protected readonly id = computed(() => {
    const id = Number(this.babyId());
    return Number.isInteger(id) && id > 0 ? id : undefined;
  });

  protected readonly baby = rxResource<Baby, number | undefined>({
    params: () => this.id(),
    stream: ({ params }) => this.babyApi.getById(params),
  });

  // `version()` in params: dupa orice notare (foaia "＋ Adaugă"), faptele se reimprospateaza.
  protected readonly today = rxResource({
    params: () => this.activityParams(),
    stream: ({ params }) => (params ? this.activityApi.getToday(params.id) : of([])),
    defaultValue: [] as Activity[],
  });

  private readonly history = rxResource({
    params: () => this.activityParams(),
    stream: ({ params }) => (params ? this.activityApi.getForBaby(params.id) : of([])),
    defaultValue: [] as Activity[],
  });

  protected readonly deleting = signal(false);

  protected readonly notFound = computed(() => {
    if (this.id() === undefined) {
      return true;
    }
    const error = this.baby.error();
    return error instanceof HttpErrorResponse && error.status === 404;
  });

  /** Bebelusul incarcat, sau `undefined` (se incarca / eroare). Nu arunca niciodata. */
  protected readonly current = computed(() => (this.baby.error() ? undefined : this.baby.value()));

  protected readonly initials = computed(() => initialsOf(this.current()?.name ?? ''));
  protected readonly birthDate = computed(() => {
    const baby = this.current();
    return baby ? birthDateLabel(baby.dateOfBirth) : '';
  });
  protected readonly age = computed(() => {
    const baby = this.current();
    return baby ? ageLabel(baby.dateOfBirth, this.clock.today()) : '';
  });

  /** "2 mese", "1 somn"... doar tipurile notate azi, in ordinea fixa a tipurilor. */
  protected readonly todayCounts = computed(() => {
    if (this.today.error()) {
      return [];
    }
    const activities = this.today.value();
    return ACTIVITY_TYPES.map((type) => ({
      type,
      count: activities.filter((activity) => activity.type === type).length,
    }))
      .filter((entry) => entry.count > 0)
      .map(({ type, count }) => ({
        type,
        icon: ACTIVITY_META[type].icon,
        tone: ACTIVITY_META[type].tone,
        label: countLabel(count, ACTIVITY_NOUN[type]),
      }));
  });

  protected readonly todayLoading = computed(
    () => this.today.isLoading() && !this.today.error() && this.today.value().length === 0,
  );

  protected readonly lastFeeding = computed(() => this.lastOf('Feeding'));
  protected readonly lastSleep = computed(() => this.lastOf('Sleep'));

  protected readonly historyLoading = computed(
    () => this.history.isLoading() && !this.history.error() && this.history.value().length === 0,
  );
  protected readonly historyFailed = computed(() => !!this.history.error());

  constructor() {
    // Intrarea pe profil face bebelusul activ (bara de sus, Azi, "＋ Adaugă").
    effect(() => {
      const id = this.id();
      if (id !== undefined) {
        untracked(() => this.active.select(id));
      }
    });
  }

  protected async remove(): Promise<void> {
    const baby = this.current();
    if (!baby || this.deleting()) {
      return;
    }

    const confirmed = await this.confirm.confirm({
      title: 'Ștergi bebelușul?',
      message: `Ștergi bebelușul ${baby.name} și toate activitățile? Nu se poate anula.`,
      confirmLabel: 'Șterge',
      destructive: true,
    });
    if (!confirmed) {
      return;
    }

    this.deleting.set(true);
    try {
      await firstValueFrom(this.babyApi.delete(baby.id), { defaultValue: undefined });
    } catch (error) {
      // 404: a fost deja sters (alt tab); rezultatul e acelasi, deci continuam.
      if (!(error instanceof HttpErrorResponse && error.status === 404)) {
        this.deleting.set(false);
        this.toasts.show({ message: 'Nu am putut șterge. Încearcă din nou.', tone: 'danger' });
        return;
      }
    }

    // ActiveBaby cade singur pe alt bebelus; fara niciunul, mergem la prima pornire.
    await reloadBabies(this.active, this.injector);
    this.toasts.show({ message: `Bebelușul ${baby.name} a fost șters`, tone: 'success' });
    const noneLeft = !this.active.error() && this.active.babies().length === 0;
    await this.router.navigateByUrl(noneLeft ? '/welcome' : '/babies');
  }

  private activityParams(): { id: number; version: number } | undefined {
    const id = this.id();
    return id === undefined ? undefined : { id, version: this.changes.version() };
  }

  /** Cea mai recenta activitate de un tip, fara sa presupunem ordinea de la server. */
  private lastOf(type: ActivityType): LastMoment | null {
    if (this.history.error()) {
      return null;
    }
    // Comparam momente (Date.parse), nu siruri: fractiunile de secunda au lungimi diferite.
    let latest: Activity | null = null;
    let latestMs = -Infinity;
    for (const activity of this.history.value()) {
      const ms = Date.parse(activity.occurredAt);
      if (activity.type === type && ms > latestMs) {
        latest = activity;
        latestMs = ms;
      }
    }
    return latest
      ? { iso: latest.occurredAt, relative: relativeLabel(latest.occurredAt, this.clock.now()) }
      : null;
  }
}
