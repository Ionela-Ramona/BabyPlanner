import { Component, booleanAttribute, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { Stitch } from '../stitch/stitch';
import { EMPTY_STATE_ILLUSTRATIONS, EmptyStateIllustration } from './illustrations';

/**
 * Un moment gol cu adevarat proiectat: ilustratie, titlu, mesaj care invata
 * ceva, apoi actiunile proiectate. Fara card in jur implicit — `framed` adauga
 * suprafata "carte de bebelus" (cusatura + fundal de carton) cand contextul o
 * cere (de exemplu intr-o foaie).
 */
@Component({
  selector: 'app-empty-state',
  imports: [Stitch],
  host: {
    class: 'empty-state',
    '[class.empty-state--framed]': 'framed()',
    '[class.empty-state--compact]': 'compact()',
  },
  template: `
    @if (illustrationSvg(); as svg) {
      <span class="empty-state__illustration" [innerHTML]="svg"></span>
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
      display: block;
      width: 160px;
      height: 160px;
      margin-bottom: var(--space-2);
    }

    /* Sub alt continut (ex. dalele de pe Azi): ilustratia mai mica, ca titlul si
       butonul sa incapa deasupra barei de jos pe telefon. */
    :host(.empty-state--compact) {
      padding-block: var(--space-4);
    }

    /* zoom, nu width: SVG-ul vine prin innerHTML, deci stilurile incapsulate nu-l ating. */
    :host(.empty-state--compact) .empty-state__illustration {
      zoom: 0.6;
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
  /** Una din ilustratiile din `illustrations.ts`, ex. `sleepy-star.svg`. */
  readonly illustration = input<EmptyStateIllustration>();
  readonly headingLevel = input<2 | 3>(2);
  /** Pune starea goala intr-o suprafata cu cusatura, pentru context inchis (ex. o foaie). */
  readonly framed = input(false, { transform: booleanAttribute });
  /** Ilustratie si spatiere mai mici, pentru o stare goala sub alt continut. */
  readonly compact = input(false, { transform: booleanAttribute });

  private readonly sanitizer = inject(DomSanitizer);

  /**
   * SVG-ul inline. `bypassSecurityTrustHtml` e sigur aici: textul vine doar din
   * fisierele noastre din public/illustrations/, compilate in bundle, niciodata
   * din date primite de la utilizator sau de la server.
   */
  protected readonly illustrationSvg = computed<SafeHtml | null>(() => {
    const name = this.illustration();
    return name ? this.sanitizer.bypassSecurityTrustHtml(EMPTY_STATE_ILLUSTRATIONS[name]) : null;
  });
}
