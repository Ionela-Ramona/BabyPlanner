import { Component, computed, signal } from '@angular/core';

import { ACTIVITY_META, ACTIVITY_TYPES, ActivityType } from '../../../core/models/activity-type';
import { ActivityBadge } from '../../../shared/components/activity-badge/activity-badge';
import { ActivityPicker } from '../../../shared/components/activity-picker/activity-picker';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { FilterChips } from '../../../shared/components/filter-chips/filter-chips';

/** Sectiunea "Activități: cuburi, filtre, insigne, avatar" din vitrina (BP-UI-09). */
@Component({
  selector: 'app-activity-section',
  imports: [ActivityPicker, FilterChips, ActivityBadge, Avatar],
  template: `
    <section class="showcase-section">
      <h3>Activități: cuburi, filtre, insigne, avatar</h3>

      <h4>Cuburi — niciunul selectat</h4>
      <app-activity-picker />

      <h4>Cuburi — "{{ pickedLabel() }}" selectat</h4>
      <app-activity-picker [(value)]="picked" />

      <h4>Chip-uri — "Toate" selectat</h4>
      <app-filter-chips />

      <h4>Chip-uri — "Somn" selectat</h4>
      <app-filter-chips [(value)]="filtered" />

      <h4>Insigne</h4>
      <div class="showcase-row">
        @for (type of activityTypes; track type) {
          <app-activity-badge [type]="type" />
        }
      </div>
      <div class="showcase-row">
        @for (type of activityTypes; track type) {
          <app-activity-badge [type]="type" size="sm" />
        }
      </div>
      <div class="showcase-row">
        @for (type of activityTypes; track type) {
          <app-activity-badge [type]="type" [iconOnly]="true" />
        }
      </div>

      <h4>Avataruri</h4>
      <div class="showcase-row showcase-row--center">
        <app-avatar name="Maria" [size]="32" />
        <app-avatar name="Maria" [size]="40" />
        <app-avatar name="Maria" [size]="56" />
        <app-avatar name="Ștefan Ionuț" [size]="40" />
      </div>
    </section>
  `,
  styles: `
    .showcase-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin-block: var(--space-2);
    }

    .showcase-row--center {
      align-items: center;
    }
  `,
})
export class ActivitySection {
  protected readonly activityTypes = ACTIVITY_TYPES;

  protected readonly picked = signal<ActivityType | undefined>('Sleep');
  protected readonly filtered = signal<ActivityType | undefined>('Sleep');

  protected readonly pickedLabel = computed(() => {
    const type = this.picked();
    return type ? ACTIVITY_META[type].label : '';
  });
}
