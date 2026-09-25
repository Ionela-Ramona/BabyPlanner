import { Component, ElementRef, afterNextRender, input, signal, viewChild } from '@angular/core';

export type DividerVariant = 'stitch' | 'line';

/**
 * Separator orizontal: linie punctata caramel (`stitch`, cusatura groasa) sau
 * linie subtire de hartie (`line`). Pur decorativ (`aria-hidden`) cand nu are
 * eticheta; cu eticheta proiectata (ex. "Dimineața") devine text vizibil intre
 * doua segmente de linie si capata `role="separator"`, pentru ca atunci chiar
 * imparte continutul in sectiuni cu sens, nu doar vizual.
 */
@Component({
  selector: 'app-divider',
  host: {
    class: 'divider',
    '[class.divider--stitch]': "variant() === 'stitch'",
    '[class.divider--line]': "variant() === 'line'",
    '[class.divider--labeled]': 'hasLabel()',
    '[attr.role]': "hasLabel() ? 'separator' : null",
    '[attr.aria-hidden]': "hasLabel() ? null : 'true'",
  },
  template: `
    <span class="divider__segment divider__segment--start"></span>
    <span class="divider__label" #label><ng-content /></span>
    <span class="divider__segment divider__segment--end"></span>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      width: 100%;
    }

    .divider__segment {
      flex: 1 1 auto;
      height: 1.5px;
    }

    :host(.divider--line) .divider__segment {
      height: 1px;
      background-color: var(--color-border);
    }

    /* Aceeasi tehnica de gradient ca m.baseline, doar mai groasa: liniute identice
       in orice browser, nu un border-style: dashed care variaza intre motoare. */
    :host(.divider--stitch) .divider__segment {
      background-image: linear-gradient(90deg, var(--caramel) 0 6px, transparent 6px 10px);
      /* Fara background-size, gradientul se intinde pe tot segmentul si ramane o singura liniuta. */
      background-size: 10px 100%;
      background-repeat: repeat-x;
      background-position: center;
    }

    .divider__label {
      display: none;
      flex: 0 0 auto;
      padding: 0 var(--space-2);
      color: var(--color-text-muted);
      font-size: var(--text-small);
      font-weight: 700;
      white-space: nowrap;
    }

    /* Fara eticheta, al doilea segment dispare ca sa nu apara o cusatura intrerupta
       la mijloc: primul segment intinde linia pe toata latimea. */
    :host(:not(.divider--labeled)) .divider__segment--end {
      display: none;
    }

    :host(.divider--labeled) .divider__label {
      display: inline-block;
    }
  `,
})
export class Divider {
  readonly variant = input<DividerVariant>('stitch');

  private readonly labelRef = viewChild<ElementRef<HTMLElement>>('label');
  protected readonly hasLabel = signal(false);

  constructor() {
    // Verificam dupa primul randare daca ceva a fost proiectat in eticheta;
    // un divider fara continut ramane pur decorativ.
    afterNextRender(() => {
      const text = this.labelRef()?.nativeElement.textContent ?? '';
      this.hasLabel.set(text.trim().length > 0);
    });
  }
}
