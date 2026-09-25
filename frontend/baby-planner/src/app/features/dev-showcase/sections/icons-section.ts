import { Component } from '@angular/core';

import { Icon } from '../../../shared/components/icon/icon';
import { ICON_NAMES } from '../../../shared/components/icon/icon-names';
import { Wordmark } from '../../../shared/components/wordmark/wordmark';

/** Sectiunea "Iconițe și wordmark" din vitrina: tot sprite-ul, wordmark-ul si piesele decorative. */
@Component({
  selector: 'app-icons-section',
  imports: [Icon, Wordmark],
  template: `
    <section class="showcase-section">
      <h3>Iconițe și wordmark</h3>

      <div class="group">
        <h4>Wordmark</h4>
        <div class="wordmarks">
          <app-wordmark />
          <app-wordmark compact />
        </div>
      </div>

      <div class="group">
        <h4>Mărimi (16 / 20 / 24 / 32px)</h4>
        <div class="sizes-row">
          @for (name of sizeSamples; track name) {
            <div class="sizes-row__item">
              @for (size of sizes; track size) {
                <app-icon [name]="name" [size]="size" />
              }
            </div>
          }
        </div>
      </div>

      <div class="group">
        <h4>Toate iconițele ({{ names.length }})</h4>
        <div class="icon-grid">
          @for (name of names; track name) {
            <div class="icon-grid__item">
              <app-icon [name]="name" />
              <span class="icon-grid__name">{{ name }}</span>
            </div>
          }
        </div>
      </div>

      <div class="group">
        <h4>Piese decorative</h4>
        <div class="illustration-grid">
          @for (illustration of illustrations; track illustration) {
            <div class="illustration-grid__item">
              <img [src]="'illustrations/' + illustration + '.svg'" alt="" />
              <span class="icon-grid__name">{{ illustration }}</span>
            </div>
          }
        </div>
      </div>

      <div class="group">
        <h4>Favicon</h4>
        <div class="favicon-row">
          <img src="icons/favicon.svg" alt="" width="40" height="40" />
          <img src="icons/apple-touch-icon.png" alt="" width="40" height="40" />
        </div>
      </div>
    </section>
  `,
  styles: `
    .group {
      display: grid;
      gap: var(--space-3);
      margin-bottom: var(--space-6);
    }

    h4 {
      margin: 0;
      font-size: var(--text-lead);
      font-family: var(--font-display);
      font-weight: 500;
    }

    .wordmarks {
      display: flex;
      align-items: center;
      gap: var(--space-6);
      padding: var(--space-3);
      border-radius: var(--radius-md);
      background: var(--color-surface);
    }

    .sizes-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-6);
    }

    .sizes-row__item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      color: var(--color-text);
    }

    .icon-grid,
    .illustration-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(4.5rem, 1fr));
      gap: var(--space-4);
    }

    .icon-grid__item,
    .illustration-grid__item {
      display: grid;
      justify-items: center;
      gap: var(--space-1);
      color: var(--color-text);
    }

    .illustration-grid__item img {
      width: 3.5rem;
      height: 3.5rem;
      object-fit: contain;
    }

    .icon-grid__name {
      font-size: var(--text-caption);
      color: var(--color-text-muted);
      text-align: center;
      word-break: break-word;
    }

    .favicon-row {
      display: flex;
      gap: var(--space-3);
      align-items: center;
      padding: var(--space-3);
      border-radius: var(--radius-md);
      background: var(--color-surface);
    }
  `,
})
export class IconsSection {
  protected readonly names = ICON_NAMES;
  protected readonly sizes = [16, 20, 24, 32] as const;
  protected readonly sizeSamples = ['feeding', 'star', 'today'] as const;
  protected readonly illustrations = [
    'sleepy-star',
    'star',
    'cloud',
    'bunting',
    'balloon',
    'blocks',
    'confetti',
  ] as const;
}
