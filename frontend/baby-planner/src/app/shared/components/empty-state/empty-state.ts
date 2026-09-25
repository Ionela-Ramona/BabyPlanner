import { NgOptimizedImage } from '@angular/common';
import { Component, booleanAttribute, input } from '@angular/core';

import { Stitch } from '../stitch/stitch';

/**
 * Un moment gol cu adevarat proiectat: ilustratie, titlu, mesaj care invata
 * ceva, apoi actiunile proiectate. Fara card in jur implicit — `framed` adauga
 * suprafata "carte de bebelus" (cusatura + fundal de carton) cand contextul o
 * cere (de exemplu intr-o foaie).
 */
@Component({
  selector: 'app-empty-state',
  imports: [NgOptimizedImage, Stitch],
  host: {
    class: 'empty-state',
    '[class.empty-state--framed]': 'framed()',
  },
  template: `
    @if (illustration(); as src) {
      <img
        class="empty-state__illustration"
        [ngSrc]="'illustrations/' + src"
        alt=""
        width="160"
        height="160"
        [priority]="priority()"
      />
    }

    @switch (headingLevel()) {
      @case (3) {
        <h3 class="empty-state__title">{{ title() }}</h3>
      }
      @default {
        <h2 class="empty-state__title">{{ title() }}</h2>
      }
    }

    @if (message(); as message) {
      <p class="empty-state__message text-muted">{{ message }}</p>
    }

    <div class="empty-state__actions">
      <ng-content select="[actions]" />
    </div>

    @if (framed()) {
      <app-stitch [radius]="16" />
    }
  `,
  styles: `
    :host {
      position: relative;
      display: grid;
      justify-items: center;
      gap: var(--space-2);
      padding: var(--space-8) var(--space-5);
      text-align: center;
    }

    :host(.empty-state--framed) {
      border-radius: var(--radius-xl);
      background-color: var(--color-surface);
      box-shadow: var(--shadow-md);
    }

    .empty-state__illustration {
      margin-bottom: var(--space-2);
    }

    .empty-state__title {
      margin: 0;
    }

    .empty-state__message {
      max-width: 32ch;
      margin: 0;
    }

    .empty-state__actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      justify-content: center;
      margin-top: var(--space-3);
    }

    .empty-state__actions:empty {
      display: none;
    }
  `,
})
export class EmptyState {
  readonly title = input.required<string>();
  readonly message = input<string>();
  /** Numele fisierului din `public/illustrations/`, ex. `sleepy-star.svg`. */
  readonly illustration = input<string>();
  readonly headingLevel = input<2 | 3>(2);
  /** Pune starea goala intr-o suprafata cu cusatura, pentru context inchis (ex. o foaie). */
  readonly framed = input(false, { transform: booleanAttribute });
  /**
   * Ilustratia e elementul principal al paginii (ex. pagina 404): o incarcam
   * imediat, nu lazy. Fara `priority`, NgOptimizedImage o incarca lazy implicit.
   */
  readonly priority = input(false, { transform: booleanAttribute });
}
