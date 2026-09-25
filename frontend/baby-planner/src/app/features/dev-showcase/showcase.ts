import { Component } from '@angular/core';

import { ActivitySection } from './sections/activity-section';
import { ButtonsSection } from './sections/buttons-section';
import { FeedbackSection } from './sections/feedback-section';
import { FieldsSection } from './sections/fields-section';
import { IconsSection } from './sections/icons-section';
import { ShapesSection } from './sections/shapes-section';
import { SurfacesSection } from './sections/surfaces-section';
import { TokensSection } from './sections/tokens-section';

/**
 * Vitrina de componente (doar in development, vezi app.routes.ts).
 *
 * Fiecare sectiune apare de doua ori, in tema de zi si in tema de noapte, una langa
 * alta pe desktop. Clasele .theme-paper / .theme-night (styles/_themes.scss) re-declara
 * tokenii pe container, deci componentele din interior nu stiu ca sunt "fortate".
 */
@Component({
  selector: 'app-showcase',
  imports: [
    TokensSection,
    IconsSection,
    SurfacesSection,
    ShapesSection,
    ButtonsSection,
    FieldsSection,
    ActivitySection,
    FeedbackSection,
  ],
  template: `
    <h1>Componente</h1>
    <p class="text-muted">
      Fiecare componentă, în fiecare variantă și stare, în ambele teme. Pagină de lucru, nu
      apare în build-ul de producție.
    </p>

    <div class="columns">
      @for (theme of themes; track theme.id) {
        <div class="column" [class]="theme.className">
          <h2 class="column__title">{{ theme.label }}</h2>
          <app-tokens-section />
          <app-icons-section />
          <app-surfaces-section />
          <app-shapes-section />
          <app-buttons-section />
          <app-fields-section />
          <app-activity-section />
          <app-feedback-section />
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    /* minmax(0, 1fr), nu 1fr: altfel coloana nu se poate ingusta sub latimea
       minima a continutului (sirul de chip-uri care defileaza lateral). */
    .columns {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--space-6);
    }

    @media (min-width: 80rem) {
      .columns {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    .column {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--space-8);
      align-content: start;
      padding: var(--space-6) var(--space-4);
      border-radius: var(--radius-xl);
      background-color: var(--color-bg);
      color: var(--color-text);
    }

    .column__title {
      margin: 0;
    }
  `,
})
export class Showcase {
  protected readonly themes = [
    { id: 'paper', label: 'Paper (zi)', className: 'column theme-paper' },
    { id: 'night', label: 'Night nursery (noapte)', className: 'column theme-night' },
  ] as const;
}
