import { Component, booleanAttribute, computed, input } from '@angular/core';

import { ACTIVITY_META, ActivityType } from '../../../core/models/activity-type';
import { Icon } from '../icon/icon';

export type ActivityBadgeSize = 'sm' | 'md';

/**
 * Insigna unui tip de activitate: iconita + eticheta, colorate cu tonul tipului.
 * Inlocuieste vechile pastile `.activity__type` cu culori HSL fara legatura cu
 * paleta. Identitatea (eticheta, iconita, tonul) vine mereu din `ACTIVITY_META`.
 */
@Component({
  selector: 'app-activity-badge',
  imports: [Icon],
  host: {
    class: 'badge',
    '[class.badge--sm]': "size() === 'sm'",
    '[attr.data-tone]': 'meta().tone',
  },
  template: `
    <app-icon [name]="meta().icon" [size]="16" />
    <span [class.visually-hidden]="iconOnly()">{{ meta().label }}</span>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      padding: var(--space-1) var(--space-2);
      border: 1px solid color-mix(in srgb, var(--block-ink) 18%, transparent);
      border-radius: var(--radius-pill);
      background: var(--block-soft);
      color: var(--block-ink);
      font: 700 var(--text-caption) / 1.2 var(--font-sans);
      white-space: nowrap;
    }

    :host(.badge--sm) {
      padding: 0.125rem var(--space-2);
      font-size: 0.75rem;
    }
  `,
})
export class ActivityBadge {
  readonly type = input.required<ActivityType>();
  readonly size = input<ActivityBadgeSize>('md');

  /** Eticheta ramane in DOM pentru screen reader, dar e ascunsa vizual (`.visually-hidden`). */
  readonly iconOnly = input(false, { transform: booleanAttribute });

  protected readonly meta = computed(() => ACTIVITY_META[this.type()]);
}
