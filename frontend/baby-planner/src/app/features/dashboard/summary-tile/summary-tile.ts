import { Component, booleanAttribute, computed, input, output } from '@angular/core';

import { ACTIVITY_META, ActivityType } from '../../../core/models/activity-type';
import { Card } from '../../../shared/components/card/card';
import { Icon } from '../../../shared/components/icon/icon';
import { ACTIVITY_NOUN, countLabel, relativeLabel, timeLabel } from '../../../shared/utils/ro-time';
import { TYPE_COPY, TypeSummary } from '../today-summary';

/**
 * O dala de pe Azi: cand s-a intamplat ultima data un tip si de cate ori azi.
 *
 * Cu cel putin o activitate, dala e un buton de comutare (`aria-pressed`) care
 * filtreaza cronologia. Fara nicio activitate azi nu are ce filtra, asa ca
 * devine invitatia de a nota una (`log`) — o dala goala nu e un filtru mort.
 *
 * `now` vine din Clock prin pagina: "acum 2 ore" se recalculeaza la fiecare minut.
 */
@Component({
  selector: 'app-summary-tile',
  imports: [Card, Icon],
  template: `
    <app-card class="tile-card" variant="tinted" [tone]="meta().tone" padding="none">
      <button
        type="button"
        class="tile"
        [attr.aria-pressed]="summary().last ? active() : null"
        [attr.aria-label]="accessibleName()"
        (click)="activate()"
      >
        <span class="tile__head">
          <span class="tile__block"><app-icon [name]="meta().icon" [size]="20" /></span>
          <span class="tile__label">{{ meta().label }}</span>
          @if (active()) {
            <app-icon class="tile__check" name="check" [size]="18" />
          }
        </span>
        @if (summary().last; as last) {
          <span class="tile__when">{{ relative() }}</span>
          <span class="tile__meta">
            <time class="tabular-nums" [attr.datetime]="last.occurredAt">{{ time() }}</time>
            <span aria-hidden="true">·</span>
            <span>{{ count() }}</span>
          </span>
        } @else {
          <span class="tile__when tile__when--none">Încă nimic azi</span>
          <span class="tile__meta tile__meta--add">
            <app-icon name="plus" [size]="16" />
            {{ copy().add }}
          </span>
        }
      </button>
    </app-card>
  `,
  styles: `
    @use 'styles/mixins' as m;

    :host {
      display: block;
    }

    .tile-card {
      height: 100%;
    }

    .tile {
      display: grid;
      align-content: start;
      gap: var(--space-1);
      width: 100%;
      height: 100%;
      min-height: 6.75rem;
      padding: var(--space-3) var(--space-4) var(--space-4);
      border: 0;
      border-radius: var(--radius-lg);
      background: transparent;
      color: var(--color-text);
      font: inherit;
      text-align: left;
      cursor: pointer;
      transition:
        background-color var(--dur-fast) var(--ease-out),
        box-shadow var(--dur-fast) var(--ease-out);
    }

    @media (hover: hover) {
      .tile:hover {
        background-color: color-mix(in srgb, var(--block-fill) 22%, transparent);
      }
    }

    .tile:active {
      background-color: color-mix(in srgb, var(--block-fill) 30%, transparent);
    }

    /* Filtrul activ: un inel in linia familiei, plus bifa (nu doar culoare). */
    .tile[aria-pressed='true'] {
      box-shadow: inset 0 0 0 2px var(--block-line);
    }

    .tile__head {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-1);
    }

    /* Cubul de lemn al tipului, acelasi ca in selectorul de activitati. */
    .tile__block {
      @include m.block;

      display: grid;
      flex: none;
      place-items: center;
      width: 2.25rem;
      height: 2.25rem;
      color: var(--block-ink);
    }

    .tile__label {
      min-width: 0;
      color: var(--color-text-strong);
      font-weight: 700;
      overflow-wrap: anywhere;
    }

    .tile__check {
      margin-left: auto;
      color: var(--block-ink);
    }

    .tile__when {
      color: var(--color-text-strong);
      font-size: var(--text-lead);
      font-weight: 800;
      line-height: 1.25;
    }

    .tile__when--none {
      font-size: var(--text-body);
      font-weight: 700;
    }

    .tile__meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0 var(--space-1);
      color: var(--block-ink);
      font-size: var(--text-small);
      font-weight: 600;
    }

    .tile__meta--add {
      font-weight: 700;
    }

    @media (forced-colors: active) {
      .tile[aria-pressed='true'] {
        outline: 2px solid Highlight;
        outline-offset: -2px;
      }
    }
  `,
})
export class SummaryTile {
  readonly summary = input.required<TypeSummary>();
  readonly now = input.required<Date>();
  /** Tipul acestei dale e filtrul curent al cronologiei. */
  readonly active = input(false, { transform: booleanAttribute });

  /** Apasare pe o dala cu activitati: comuta filtrul pe acest tip. */
  readonly filter = output<ActivityType>();
  /** Apasare pe o dala goala: deschide notarea unei activitati de acest tip. */
  readonly log = output<ActivityType>();

  protected readonly meta = computed(() => ACTIVITY_META[this.summary().type]);
  protected readonly copy = computed(() => TYPE_COPY[this.summary().type]);

  protected readonly relative = computed(() => {
    const last = this.summary().last;
    return last ? relativeLabel(last.occurredAt, this.now()) : '';
  });

  protected readonly time = computed(() => {
    const last = this.summary().last;
    return last ? timeLabel(last.occurredAt) : '';
  });

  protected readonly count = computed(() =>
    countLabel(this.summary().count, ACTIVITY_NOUN[this.summary().type]),
  );

  /** O propozitie intreaga pentru cititorul de ecran; incepe cu eticheta vizibila. */
  protected readonly accessibleName = computed(() => {
    const label = this.meta().label;
    return this.summary().last
      ? `${label}: ultima ${this.relative()}, la ${this.time()}, ${this.count()} azi`
      : `${label}: încă nimic azi. ${this.copy().add}`;
  });

  protected activate(): void {
    const { type, last } = this.summary();
    if (last) {
      this.filter.emit(type);
    } else {
      this.log.emit(type);
    }
  }
}
