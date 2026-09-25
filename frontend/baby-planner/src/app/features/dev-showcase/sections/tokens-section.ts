import { Component } from '@angular/core';

/** Sectiunea "Tokeni" din vitrina. Afiseaza paleta, tipografie, spatiere si alte tokeni. */
@Component({
  selector: 'app-tokens-section',
  template: `
    <section class="showcase-section">
      <h3>Tokeni</h3>

      <!-- Hartia: tonurile de fundal -->
      <div class="token-group">
        <h4>Hartie (paper)</h4>
        <div class="swatches">
          <div class="swatch" title="paper-ground" style="background: var(--paper-ground);"></div>
          <div class="swatch" title="paper-card" style="background: var(--paper-card);"></div>
          <div class="swatch" title="paper-highlight" style="background: var(--paper-highlight);"></div>
          <div class="swatch" title="paper-sunk" style="background: var(--paper-sunk);"></div>
          <div class="swatch" title="paper-sand" style="background: var(--paper-sand);"></div>
        </div>
      </div>

      <!-- Cerneala: tonurile text -->
      <div class="token-group">
        <h4>Cerneala (ink)</h4>
        <div class="swatches">
          <div class="swatch" title="ink-strong" style="background: var(--ink-strong);"></div>
          <div class="swatch" title="ink" style="background: var(--ink);"></div>
          <div class="swatch" title="ink-muted" style="background: var(--ink-muted);"></div>
          <div class="swatch" title="ink-line" style="background: var(--ink-line);"></div>
          <div class="swatch" title="caramel" style="background: var(--caramel);"></div>
        </div>
      </div>

      <!-- Familii pastel: fiecare cu fill, soft, line, ink -->
      <div class="token-group">
        <h4>Familii (honey, dusk, sage, blush, stone)</h4>
        @for (family of families; track family) {
          <div class="family-row">
            <span class="family-label">{{ family }}</span>
            <div class="swatches">
              <div class="swatch" [title]="family + '-fill'" [style.background]="'var(--' + family + '-fill)'"></div>
              <div class="swatch" [title]="family + '-soft'" [style.background]="'var(--' + family + '-soft)'"></div>
              <div class="swatch" [title]="family + '-line'" [style.background]="'var(--' + family + '-line)'"></div>
              <div class="swatch" [title]="family + '-ink'" [style.background]="'var(--' + family + '-ink)'"></div>
            </div>
          </div>
        }
      </div>

      <!-- Tipografie: scara text -->
      <div class="token-group">
        <h4>Tipografie</h4>
        <div class="type-scale">
          <div style="font-size: var(--text-display); font-family: var(--font-display);">Display (2.25rem)</div>
          <div style="font-size: var(--text-h1); font-family: var(--font-display);">H1 (1.75rem)</div>
          <div style="font-size: var(--text-h2); font-family: var(--font-display);">H2 (1.4375rem)</div>
          <div style="font-size: var(--text-h3); font-family: var(--font-display);">H3 (1.1875rem)</div>
          <div style="font-size: var(--text-lead); font-family: var(--font-sans);">Lead (1.125rem)</div>
          <div style="font-size: var(--text-body); font-family: var(--font-sans);">Body (1rem)</div>
          <div style="font-size: var(--text-small); font-family: var(--font-sans);">Small (0.875rem)</div>
          <div style="font-size: var(--text-caption); font-family: var(--font-sans);">Caption (0.8125rem)</div>
          <div style="font-size: var(--text-script); font-family: var(--font-script);">Maria (script, 2.5rem)</div>
        </div>
      </div>

      <!-- Spatiere: scale bars -->
      <div class="token-group">
        <h4>Spatiere (4px scale)</h4>
        <div class="spacing-scale">
          @for (space of spacings; track space) {
            <div class="spacing-row">
              <span class="spacing-label">{{ space.name }}</span>
              <div class="spacing-bar" [style.width]="space.value" style="background: var(--ink-line);"></div>
            </div>
          }
        </div>
      </div>

      <!-- Colturi: radii -->
      <div class="token-group">
        <h4>Colturi (radius)</h4>
        <div class="swatches">
          <div class="swatch" title="sm" style="border-radius: var(--radius-sm); background: var(--focus);"></div>
          <div class="swatch" title="md" style="border-radius: var(--radius-md); background: var(--focus);"></div>
          <div class="swatch" title="lg" style="border-radius: var(--radius-lg); background: var(--focus);"></div>
          <div class="swatch" title="xl" style="border-radius: var(--radius-xl); background: var(--focus);"></div>
          <div class="swatch" title="pill" style="border-radius: var(--radius-pill); background: var(--focus);"></div>
        </div>
      </div>

      <!-- Umbrele + Gradiente -->
      <div class="token-group">
        <h4>Umbrele si gradiente</h4>
        <div class="swatches">
          <div class="swatch" title="shadow-sm" style="box-shadow: var(--shadow-sm); background: var(--paper-card);"></div>
          <div class="swatch" title="shadow-md" style="box-shadow: var(--shadow-md); background: var(--paper-card);"></div>
          <div class="swatch surface-card" title="card-lift" style="background: var(--paper-card);"></div>
        </div>
      </div>

      <!-- Tonuri de activitate: o bara pe fiecare with [data-tone] -->
      <div class="token-group">
        <h4>Tonuri de activitate (data-tone)</h4>
        <div class="activity-tones">
          @for (tone of activityTones; track tone) {
            <div class="activity-tone surface-block" [attr.data-tone]="tone"></div>
          }
        </div>
      </div>

      <!-- Focus color -->
      <div class="token-group">
        <h4>Focus</h4>
        <div class="swatches">
          <div class="swatch" title="focus" style="background: var(--focus); border: 3px solid var(--focus);"></div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .token-group {
      margin-bottom: var(--space-6);
      display: grid;
      gap: var(--space-3);
    }

    h4 {
      margin: 0;
      font-size: var(--text-lead);
      font-family: var(--font-display);
      font-weight: 500;
    }

    .swatches {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
    }

    .swatch {
      width: 3rem;
      height: 3rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--ink-hairline);
      cursor: help;
      transition: transform var(--dur-fast) var(--ease-out);
    }

    .swatch:hover {
      transform: scale(1.1);
    }

    .swatch.surface-card {
      border: none;
    }

    .family-row {
      display: grid;
      grid-template-columns: 80px 1fr;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-2);
    }

    .family-label {
      font-size: var(--text-small);
      font-weight: 500;
      text-transform: capitalize;
    }

    .type-scale {
      display: grid;
      gap: var(--space-2);
      line-height: 1.2;
    }

    .spacing-scale {
      display: grid;
      gap: var(--space-2);
    }

    .spacing-row {
      display: grid;
      grid-template-columns: 60px 1fr;
      align-items: center;
      gap: var(--space-2);
    }

    .spacing-label {
      font-size: var(--text-small);
      color: var(--color-text-muted);
    }

    .spacing-bar {
      height: 0.5rem;
      border-radius: var(--radius-sm);
    }

    .activity-tones {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
    }

    .activity-tone {
      width: 3rem;
      height: 3rem;
      border-radius: var(--radius-md);
    }
  `,
})
export class TokensSection {
  protected families = ['honey', 'dusk', 'sage', 'blush', 'stone'];
  protected spacings = [
    { name: '--space-1', value: '0.25rem' },
    { name: '--space-2', value: '0.5rem' },
    { name: '--space-3', value: '0.75rem' },
    { name: '--space-4', value: '1rem' },
    { name: '--space-5', value: '1.25rem' },
    { name: '--space-6', value: '1.5rem' },
    { name: '--space-8', value: '2rem' },
  ];
  protected activityTones = ['feeding', 'sleep', 'diaper', 'medicine', 'other', 'honey', 'dusk', 'sage', 'blush', 'stone'];
}