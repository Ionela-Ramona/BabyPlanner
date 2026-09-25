import { Component, computed, input } from '@angular/core';

const AVATAR_TONES = ['honey', 'sage', 'blush', 'dusk'] as const;
type AvatarTone = (typeof AVATAR_TONES)[number];

/** Primele litere ale primelor doua cuvinte, majuscule, diacriticele pastrate (JS le urca corect: ș → Ș). */
function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

/** Un ton stabil pentru acelasi nume, ca acelasi bebelus sa aiba mereu acelasi inel. */
function toneFromName(name: string): AvatarTone {
  let hash = 0;
  for (const codePoint of name) {
    hash = (hash * 31 + (codePoint.codePointAt(0) ?? 0)) % 997;
  }
  return AVATAR_TONES[Math.abs(hash) % AVATAR_TONES.length];
}

/**
 * Initialele bebelusului intr-un cerc cu rama palida (`m.rim`), ca ramele foto din
 * imaginea de referinta. Fara poza inca — un ticket ulterior adauga `app-frame`
 * pentru fotografii; acest avatar sta bine si singur.
 *
 * Decorativ implicit (`aria-hidden`), pentru ca numele apare de obicei langa el;
 * `label` il transforma in `role="img"` cu `aria-label`, pentru locurile unde
 * avatarul e singurul indiciu (ex. selectorul de bebelus din bara de sus).
 */
@Component({
  selector: 'app-avatar',
  host: {
    class: 'avatar',
    '[attr.data-tone]': 'resolvedTone()',
    '[style.--avatar-size.px]': 'size()',
    '[attr.role]': "label() ? 'img' : null",
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': "label() ? null : 'true'",
  },
  template: `{{ initials() }}`,
  styles: `
    @use 'styles/mixins' as m;

    :host {
      @include m.rim(3px);

      --avatar-size: 40px;

      display: inline-flex;
      flex: none;
      box-sizing: border-box;
      align-items: center;
      justify-content: center;
      width: var(--avatar-size);
      height: var(--avatar-size);
      border-radius: var(--radius-pill);
      background: var(--block-soft);
      color: var(--block-ink);
      font-family: var(--font-display);
      font-size: calc(var(--avatar-size) * 0.4);
      font-weight: 700;
      line-height: 1;
      user-select: none;
    }
  `,
})
export class Avatar {
  /** Numele complet, folosit pentru initiale si (implicit) pentru tonul cercului. */
  readonly name = input.required<string>();

  /** Diametrul in px. */
  readonly size = input<number>(40);

  /** Tonul cercului; implicit derivat din nume, ca acelasi bebelus sa il pastreze. */
  readonly tone = input<AvatarTone>();

  /** Nume accesibil, cand avatarul nu sta langa numele scris. */
  readonly label = input<string>();

  protected readonly initials = computed(() => initialsOf(this.name()));
  protected readonly resolvedTone = computed(() => this.tone() ?? toneFromName(this.name()));
}
