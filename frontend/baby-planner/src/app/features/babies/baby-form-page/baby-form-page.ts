import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';

import { Baby } from '../../../core/models/baby';
import { ActiveBaby } from '../../../core/services/active-baby';
import { BabyApi } from '../../../core/services/baby-api';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { Button } from '../../../shared/components/button/button';
import { Card } from '../../../shared/components/card/card';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { Skeleton } from '../../../shared/components/skeleton/skeleton';
import { ToastService } from '../../../shared/overlays/toast.service';
import { BabyForm } from '../baby-form/baby-form';

/**
 * Pagina "Bebeluș nou" (`/babies/new`) si "Editează" (`/babies/:babyId/edit`).
 * Aceeasi componenta pentru amandoua: `babyId` lipseste la creare.
 */
@Component({
  selector: 'app-baby-form-page',
  imports: [Avatar, BabyForm, Button, Card, EmptyState, ErrorState, RouterLink, Skeleton],
  template: `
    <h1>{{ isEdit() ? 'Editează profilul' : 'Bebeluș nou' }}</h1>

    @if (!isEdit()) {
      <app-card variant="stitched" padding="lg">
        <app-baby-form submitLabel="Salvează" (saved)="onCreated($event)" (cancelled)="cancel()" />
      </app-card>
    } @else if (notFound()) {
      <app-empty-state
        illustration="cloud.svg"
        title="Nu am găsit bebelușul"
        message="Poate a fost șters între timp."
      >
        <a actions appButton routerLink="/babies">Înapoi la Bebeluși</a>
      </app-empty-state>
    } @else if (baby.error()) {
      <app-error-state
        title="Nu am putut încărca profilul"
        message="Verifică conexiunea, apoi încearcă din nou."
        (retry)="baby.reload()"
      />
    } @else if (baby.value(); as current) {
      <app-card variant="stitched" padding="lg">
        <p class="who">
          <app-avatar [name]="current.name" [size]="40" />
          <span>{{ current.name }}</span>
        </p>
        <app-baby-form [baby]="current" (saved)="onUpdated($event)" (cancelled)="cancel()" />
      </app-card>
    } @else {
      <app-skeleton variant="text" [count]="3" />
    }
  `,
  styles: `
    :host {
      display: block;
      max-width: 30rem;
    }

    .who {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin: 0 0 var(--space-5);
      color: var(--color-text-strong);
      font-family: var(--font-display);
      font-size: var(--text-lead);
      font-weight: 600;
    }
  `,
})
export class BabyFormPage {
  private readonly babyApi = inject(BabyApi);
  private readonly activeBaby = inject(ActiveBaby);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastService);

  /** Din ruta (`withComponentInputBinding`); lipseste pe `/babies/new`. */
  readonly babyId = input<string>();

  private readonly id = computed(() => {
    const raw = this.babyId();
    const id = Number(raw);
    return raw !== undefined && Number.isInteger(id) && id > 0 ? id : undefined;
  });

  protected readonly isEdit = computed(() => this.babyId() !== undefined);

  protected readonly baby = rxResource<Baby, number | undefined>({
    params: () => this.id(),
    stream: ({ params }) => this.babyApi.getById(params),
  });

  protected readonly notFound = computed(() => {
    if (this.isEdit() && this.id() === undefined) {
      return true;
    }
    const error = this.baby.error();
    return error instanceof HttpErrorResponse && error.status === 404;
  });

  protected onCreated(baby: Baby): void {
    this.toasts.show({ message: 'Salvat', tone: 'success' });
    // Lista din bara de sus trebuie sa-l contina, iar el devine bebelusul activ.
    this.activeBaby.reload();
    this.activeBaby.select(baby.id);
    void this.router.navigate(['/babies', baby.id]);
  }

  protected onUpdated(baby: Baby): void {
    this.toasts.show({ message: 'Salvat', tone: 'success' });
    // Numele poate aparea in bara de sus: reincarcam lista comuna.
    this.activeBaby.reload();
    void this.router.navigate(['/babies', baby.id]);
  }

  /** Inapoi de unde a venit: profilul la editare, lista la creare. */
  protected cancel(): void {
    const id = this.id();
    void this.router.navigate(id === undefined ? ['/babies'] : ['/babies', id]);
  }
}
