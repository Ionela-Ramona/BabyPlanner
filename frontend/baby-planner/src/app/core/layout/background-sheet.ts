import { DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';

import { Button } from '../../shared/components/button/button';
import { Icon } from '../../shared/components/icon/icon';
import { SheetFooter } from '../../shared/overlays/sheet-footer';
import { SheetHeader } from '../../shared/overlays/sheet-header';
import { BACKGROUNDS, Background, ThemeService } from '../services/theme';
import { ThemeToggle } from './theme-toggle';

const LABELS: Readonly<Record<Background, string>> = {
  cream: 'Crem',
  rose: 'Roz',
  mint: 'Mentă',
  sky: 'Bleu',
  lavender: 'Lavandă',
};

/**
 * Foaia "Aspect", deschisa din navigare: tema (Sistem / Luminos / Noapte) si hartia
 * temei de zi, aleasa dintr-o lista de palete verificate la contrast (styles/_tokens.scss).
 * Nu e un color picker liber: cu orice culoare, textul ar putea deveni ilizibil.
 * Stau aici, nu in bara de sus: se schimba rar, iar bara ramane a bebelusului.
 *
 * Alegerea se aplica pe loc, ca parintele sa vada pagina in spatele foii schimbandu-se;
 * "Gata" doar inchide. Mostrele folosesc `data-background-preview`, deci arata culoarea
 * de zi chiar daca pagina e pe Noapte.
 */
@Component({
  selector: 'app-background-sheet',
  imports: [Button, Icon, SheetFooter, SheetHeader, ThemeToggle],
  template: `
    <app-sheet-header
      titleId="appearance-title"
      title="Aspect"
      subtitle="Se aplică în toată aplicația și se păstrează pe acest dispozitiv."
      (close)="dialogRef.close()"
    />

    <app-theme-toggle class="section" />

    <fieldset class="backgrounds section">
      <legend class="section__title">Culoarea fundalului</legend>
      @for (background of backgrounds; track background) {
        <label class="backgrounds__option">
          <input
            class="backgrounds__input"
            type="radio"
            name="bp-background"
            [value]="background"
            [checked]="theme.background() === background"
            (change)="theme.setBackground(background)"
          />
          <span class="backgrounds__swatch" [attr.data-background-preview]="background" aria-hidden="true">
            <span class="backgrounds__card"></span>
          </span>
          <span class="backgrounds__name">{{ labels[background] }}</span>
          <app-icon class="backgrounds__check" name="check" [size]="18" />
        </label>
      }
    </fieldset>

    @if (theme.resolved() === 'dark') {
      <p class="backgrounds__note text-muted">
        Acum ești pe tema Noapte, care rămâne întunecată. Culoarea aleasă se vede în tema Luminos.
      </p>
    }

    <app-sheet-footer>
      <button appButton type="button" (click)="dialogRef.close()">Gata</button>
    </app-sheet-footer>
  `,
  styles: `
    .section {
      display: block;
      margin-top: var(--space-5);
    }

    .backgrounds {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(6.5rem, 1fr));
      gap: var(--space-3);
      padding: 0;
      border: 0;
    }

    .section__title {
      margin-bottom: var(--space-3);
      padding: 0;
      color: var(--color-text-strong);
      font-weight: 800;
    }

    .backgrounds__option {
      position: relative;
      display: grid;
      justify-items: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-2);
      border: 2px solid transparent;
      border-radius: var(--radius-lg);
      color: var(--color-text);
      cursor: pointer;
      transition: border-color var(--dur-fast) var(--ease-out);
    }

    /* Inputul acopera toata optiunea (tinta mare), dar e invizibil. */
    .backgrounds__input {
      position: absolute;
      inset: 0;
      margin: 0;
      opacity: 0;
      cursor: pointer;
    }

    /* Mostra: hartia paletei, cu un "card" mic deasupra, ca in aplicatie. */
    .backgrounds__swatch {
      display: grid;
      place-items: end center;
      width: 4rem;
      height: 4rem;
      padding-bottom: var(--space-2);
      border: 1px solid var(--ink-line);
      border-radius: var(--radius-pill);
      background-color: var(--paper-ground);
    }

    .backgrounds__card {
      width: 2.25rem;
      height: 1.25rem;
      border: 1px solid var(--paper-sand);
      border-radius: var(--radius-sm);
      background-color: var(--paper-card);
    }

    .backgrounds__name {
      font-weight: 700;
    }

    .backgrounds__check {
      position: absolute;
      top: var(--space-2);
      right: var(--space-2);
      color: var(--honey-ink);
      visibility: hidden;
    }

    .backgrounds__option:has(:checked) {
      border-color: var(--honey-line);
      background-color: var(--color-surface-muted);

      .backgrounds__check {
        visibility: visible;
      }
    }

    .backgrounds__option:has(:focus-visible) {
      outline: 2px solid var(--color-focus);
      outline-offset: 2px;
    }

    @media (hover: hover) {
      .backgrounds__option:hover:not(:has(:checked)) {
        border-color: var(--color-border);
      }
    }

    @media (forced-colors: active) {
      .backgrounds__option:has(:checked) {
        border-color: Highlight;
      }
    }

    .backgrounds__note {
      margin: var(--space-4) 0 0;
    }
  `,
})
export class BackgroundSheet {
  protected readonly theme = inject(ThemeService);
  protected readonly dialogRef = inject(DialogRef);

  protected readonly backgrounds = BACKGROUNDS;
  protected readonly labels = LABELS;
}
