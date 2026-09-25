import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Baby } from '../../core/models/baby';
import { ActiveBaby } from '../../core/services/active-baby';
import { Card } from '../../shared/components/card/card';
import { ToastService } from '../../shared/overlays/toast.service';
import { BabyForm } from '../babies/baby-form/baby-form';

/**
 * Prima pornire (`/welcome`): inca nu exista niciun bebelus. Acelasi formular ca
 * "Bebeluș nou", fara "Anulează" (nu avem unde ne intoarce), apoi direct la Azi.
 */
@Component({
  selector: 'app-welcome',
  imports: [BabyForm, Card, NgOptimizedImage],
  template: `
    <img
      class="welcome__art"
      ngSrc="illustrations/bunting.svg"
      width="200"
      height="62"
      alt=""
      priority
    />
    <h1 class="welcome__title script">Bun venit!</h1>
    <p class="welcome__lead">Hai să adăugăm bebelușul.</p>

    <app-card variant="stitched" padding="lg">
      <app-baby-form submitLabel="Adaugă bebelușul" [cancellable]="false" (saved)="onSaved($event)" />
    </app-card>
  `,
  styles: `
    :host {
      display: grid;
      justify-items: center;
      max-width: 30rem;
      margin-inline: auto;
      padding-top: var(--space-6);
      text-align: center;
    }

    .welcome__art {
      width: min(14rem, 70%);
      height: auto;
    }

    .welcome__title {
      margin: var(--space-4) 0 0;
      color: var(--honey-ink);
      font-size: 3.25rem;
      line-height: 1.1;
    }

    .welcome__lead {
      margin: var(--space-2) 0 var(--space-8);
      color: var(--color-text);
      font-size: var(--text-lead);
    }

    app-card {
      width: 100%;
      text-align: start;
    }
  `,
})
export class Welcome {
  private readonly activeBaby = inject(ActiveBaby);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastService);

  protected onSaved(baby: Baby): void {
    this.toasts.show({ message: 'Salvat', tone: 'success' });
    // Garda de pe /dashboard asteapta sfarsitul reincarcarii, deci nu ne intoarce aici.
    this.activeBaby.reload();
    this.activeBaby.select(baby.id);
    void this.router.navigateByUrl('/dashboard');
  }
}
