import { Component } from '@angular/core';

import { ACTIVITY_TYPE_LABELS } from '../../../core/models/activity-type';
import { Card } from '../../../shared/components/card/card';
import { Divider } from '../../../shared/components/divider/divider';
import { Edge } from '../../../shared/components/edge/edge';
import { Stitch } from '../../../shared/components/stitch/stitch';

/** Sectiunea "Suprafețe: card, cusătură, margine, separator" din vitrina. */
@Component({
  selector: 'app-surfaces-section',
  imports: [Card, Divider, Stitch, Edge],
  template: `
    <section class="showcase-section">
      <h3>Suprafețe: card, cusătură, margine, separator</h3>

      <div class="showcase-group">
        <h4>Card — plain, stitched, tinted</h4>
        <div class="card-row">
          <app-card variant="plain">
            <h4>Plain</h4>
            <p class="text-small text-muted">Hârtie ridicată, fără cusătură. Elevația vine doar din umbră.</p>
          </app-card>
          <app-card variant="stitched">
            <h4>Stitched</h4>
            <p class="text-small text-muted">Aceeași hârtie, cu cusătura caramel decorativă în interior.</p>
          </app-card>
          <app-card variant="tinted" tone="honey">
            <h4>Tinted</h4>
            <p class="text-small text-muted">Hârtie tonată — aici în miere, ca fața unui cub Masă.</p>
          </app-card>
        </div>
      </div>

      <div class="showcase-group">
        <h4>Tonuri de activitate (tinted, cu cusătură asortată)</h4>
        <div class="card-tone-grid">
          @for (item of activityTones; track item.tone) {
            <app-card variant="tinted" [tone]="item.tone" padding="sm">
              <p class="tone-card__label">{{ item.label }}</p>
            </app-card>
          }
        </div>
      </div>

      <div class="showcase-group">
        <h4>Separator: cusătură, linie, cu etichetă</h4>
        <div class="divider-stack">
          <app-divider variant="stitch" />
          <app-divider variant="line" />
          <app-divider variant="stitch">Dimineața</app-divider>
        </div>
      </div>

      <div class="showcase-group">
        <h4>Cusătură și margine festonată</h4>
        <div class="demo-row">
          <div class="demo-box demo-box--stitch">
            <p class="text-small text-muted">Cadru cu cusătură</p>
            <app-stitch [radius]="15" />
          </div>
          <div class="demo-box demo-box--edge">
            <app-edge position="top" />
            <p class="text-small text-muted">Bară cu muchie festonată (ex. bara de jos)</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .showcase-group {
      display: grid;
      gap: var(--space-3);
      margin-bottom: var(--space-6);
    }

    h4 {
      margin: 0;
      font-family: var(--font-display);
      font-size: var(--text-lead);
      font-weight: 500;
    }

    .card-row {
      display: grid;
      gap: var(--space-4);
      grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
    }

    .card-row h4 {
      font-size: var(--text-body);
    }

    .card-tone-grid {
      display: grid;
      gap: var(--space-3);
      grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
    }

    .tone-card__label {
      margin: 0;
      color: var(--block-ink);
      font-weight: 700;
    }

    .divider-stack {
      display: grid;
      gap: var(--space-5);
    }

    .demo-row {
      display: grid;
      gap: var(--space-4);
      grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
    }

    .demo-box {
      position: relative;
      display: grid;
      align-content: end;
      min-height: 6rem;
      padding: var(--space-4);
      border-radius: var(--radius-xl);
      background-color: var(--color-surface);
    }

    .demo-box--edge {
      align-content: start;
      padding-top: var(--space-6);
    }
  `,
})
export class SurfacesSection {
  protected readonly activityTones = [
    { tone: 'feeding', label: ACTIVITY_TYPE_LABELS.Feeding },
    { tone: 'sleep', label: ACTIVITY_TYPE_LABELS.Sleep },
    { tone: 'diaper', label: ACTIVITY_TYPE_LABELS.Diaper },
    { tone: 'medicine', label: ACTIVITY_TYPE_LABELS.Medicine },
    { tone: 'other', label: ACTIVITY_TYPE_LABELS.Other },
  ] as const;
}
