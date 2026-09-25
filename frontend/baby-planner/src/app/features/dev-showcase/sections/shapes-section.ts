import { Component } from '@angular/core';

import { Bubble } from '../../../shared/components/bubble/bubble';
import { Frame, FrameShape } from '../../../shared/components/frame/frame';
import { Ribbon } from '../../../shared/components/ribbon/ribbon';

// Poza de test, inline: NgOptimizedImage nu lucreaza cu data-URI, deci aici e un <img> simplu.
// Culorile sunt nume CSS doar pentru aceasta imagine de proba (in aplicatie vin poze reale).
const SAMPLE_PHOTO = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><defs><linearGradient id='s' x2='0' y2='1'><stop offset='0' stop-color='lightsteelblue'/><stop offset='1' stop-color='mistyrose'/></linearGradient></defs><rect width='120' height='120' fill='url(#s)'/><circle cx='82' cy='42' r='14' fill='navajowhite'/><path d='M0 86q30-22 60-4t60-6v44H0z' fill='darkkhaki'/><path d='M0 100q40-14 70 0t50-4v24H0z' fill='tan'/></svg>`,
)}`;

/** Sectiunea "Forme: ramă, panglică, bulă" din vitrina (BP-UI-06). */
@Component({
  selector: 'app-shapes-section',
  imports: [Frame, Ribbon, Bubble],
  template: `
    <section class="showcase-section">
      <h3>Forme: ramă, panglică, bulă</h3>

      <h4>Ramă</h4>
      @for (row of frames; track row.shape) {
        <div class="row">
          @for (size of sizes; track size) {
            <app-frame [shape]="row.shape" [size]="size" [tone]="row.tone">M</app-frame>
          }
          <span class="text-caption text-muted">{{ row.label }}</span>
        </div>
      }
      <div class="row">
        <app-frame [size]="200">
          <img [src]="photo" width="120" height="120" alt="Imagine de probă: soare peste dealuri" />
        </app-frame>
        <app-frame shape="circle" [size]="96">
          <img [src]="photo" width="120" height="120" alt="Imagine de probă, în ramă rotundă" />
        </app-frame>
        <app-frame shape="rounded" [size]="40" tone="sage">A</app-frame>
      </div>

      <h4>Panglică</h4>
      <div class="stack">
        <app-ribbon size="sm">Azi · joi, 25 septembrie</app-ribbon>
        <app-ribbon size="sm" decorated>Azi · joi, 25 septembrie</app-ribbon>
        <app-ribbon>Mari amintiri</app-ribbon>
        <app-ribbon decorated>Mari amintiri</app-ribbon>
      </div>

      <h4>Bulă</h4>
      <div class="stack">
        <app-bubble scriptLine="Maria">
          <p>Ești cea mai mare aventură a noastră</p>
        </app-bubble>
        <app-bubble>
          <p>Ești cea mai mare aventură a noastră</p>
        </app-bubble>
        <app-bubble align="start">
          <p>Încă nu ai notat nimic azi. Prima masă, primul somn: totul începe aici.</p>
        </app-bubble>
      </div>
    </section>
  `,
  styles: `
    h4 {
      margin-top: var(--space-6);
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-6);
      margin-bottom: var(--space-6);
    }

    .stack {
      display: grid;
      justify-items: start;
      gap: var(--space-4);
    }

    app-bubble {
      max-width: 26rem;
    }
  `,
})
export class ShapesSection {
  protected readonly photo = SAMPLE_PHOTO;

  protected readonly sizes = [48, 96, 200];

  protected readonly frames: readonly { shape: FrameShape; tone: string; label: string }[] = [
    { shape: 'cloud', tone: 'feeding', label: 'nor · feeding' },
    { shape: 'circle', tone: 'sleep', label: 'cerc · sleep' },
    { shape: 'rounded', tone: 'blush', label: 'rotunjit · blush' },
  ];
}
