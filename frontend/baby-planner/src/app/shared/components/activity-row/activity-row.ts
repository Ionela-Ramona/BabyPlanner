import { Component, computed, input, output } from '@angular/core';

import { Activity } from '../../../core/models/activity';
import { ACTIVITY_META } from '../../../core/models/activity-type';
import { timeLabel } from '../../utils/ro-time';
import { ActivityBadge } from '../activity-badge/activity-badge';
import { Icon } from '../icon/icon';

/**
 * Un rand din cronologie (Azi, Istoric, profil). Se pune intr-un `<li>`.
 *
 * Ierarhia urmeaza ce cauta parintele: ORA intai (coloana aliniata, cifre
 * tabulare), apoi NOTITELE ca text principal (acolo e informatia reala: "120 ml
 * lapte praf"), iar tipul e o insigna secundara. Fara notite, textul principal
 * devine eticheta tipului, ca randul sa nu para gol.
 *
 * Tot randul e un singur buton (tinta mare, un singur Tab), care emite `edit`.
 * Numele accesibil e o propozitie intreaga ("Masă la 16:04, 120 ml lapte praf.
 * Editează"), nu trei fragmente citite pe rand.
 */
@Component({
  selector: 'app-activity-row',
  imports: [ActivityBadge, Icon],
  host: { class: 'activity-row', '[attr.data-tone]': 'meta().tone' },
  template: `
    <button class="activity-row__button" type="button" [attr.aria-label]="accessibleName()" (click)="edit.emit(activity())">
      <time class="activity-row__time tabular-nums" [attr.datetime]="activity().occurredAt">{{ time() }}</time>
      <span class="activity-row__text">
        <span class="activity-row__primary">{{ primary() }}</span>
        @if (activity().notes) {
          <app-activity-badge class="activity-row__badge" [type]="activity().type" size="sm" />
        }
      </span>
      <app-icon class="activity-row__chevron" name="chevron-right" [size]="18" />
    </button>
  `,
  styles: `
    :host {
      display: block;
    }

    .activity-row__button {
      display: grid;
      grid-template-columns: 3.25rem minmax(0, 1fr) auto;
      align-items: center;
      gap: var(--space-3);
      width: 100%;
      min-height: var(--tap-lg);
      padding: var(--space-3) var(--space-3) var(--space-3) var(--space-4);
      border: 0;
      border-radius: var(--radius-md);
      background: transparent;
      color: var(--color-text);
      text-align: left;
      cursor: pointer;
      transition: background-color var(--dur-fast) var(--ease-out);
    }

    @media (hover: hover) {
      .activity-row__button:hover {
        background-color: var(--block-soft);
      }
    }

    .activity-row__button:active {
      background-color: var(--block-soft);
    }

    /* Ora, cu un punct colorat al tipului in stanga (ca o bila de lemn pe ata). */
    .activity-row__time {
      position: relative;
      color: var(--color-text-strong);
      font-weight: 700;
    }

    .activity-row__time::before {
      position: absolute;
      top: 50%;
      left: calc(var(--space-3) * -1);
      width: 0.375rem;
      height: 0.375rem;
      border-radius: var(--radius-pill);
      background-color: var(--block-line);
      content: '';
      transform: translate(-50%, -50%);
    }

    .activity-row__text {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-1) var(--space-2);
      min-width: 0;
    }

    .activity-row__primary {
      overflow-wrap: anywhere;
    }

    .activity-row__chevron {
      color: var(--color-text-muted);
    }

    @media (forced-colors: active) {
      .activity-row__time::before {
        background-color: CanvasText;
      }
    }
  `,
})
export class ActivityRow {
  readonly activity = input.required<Activity>();
  readonly edit = output<Activity>();

  protected readonly meta = computed(() => ACTIVITY_META[this.activity().type]);
  protected readonly time = computed(() => timeLabel(this.activity().occurredAt));
  protected readonly primary = computed(() => this.activity().notes?.trim() || this.meta().label);

  protected readonly accessibleName = computed(() => {
    const notes = this.activity().notes?.trim();
    const base = `${this.meta().label} la ${this.time()}`;
    return notes ? `${base}, ${notes}. Editează` : `${base}. Editează`;
  });
}
