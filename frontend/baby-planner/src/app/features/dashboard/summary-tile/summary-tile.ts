import { Component, booleanAttribute, computed, input, output } from '@angular/core';

import { ACTIVITY_META, ActivityType } from '../../../core/models/activity-type';
import { Card } from '../../../shared/components/card/card';
import { Icon } from '../../../shared/components/icon/icon';
import { durationLabel } from '../../../shared/utils/activity-details';
import {
  ACTIVITY_NOUN,
  countLabel,
  dayHeader,
  isSameLocalDay,
  relativeLabel,
  timeLabel,
} from '../../../shared/utils/ro-time';
import { TypeSummary } from '../today-summary';

/**
 * O dala de pe Azi: cand s-a intamplat ultima data un tip si de cate ori azi.
 *
 * Un singur inteles: apasarea noteaza (`log`). Pagina decide cum — salvare "acum"
 * la o atingere, formularul pentru tipurile care cer o notita, sau "S-a trezit"
 * cand bebelusul doarme. Filtrarea cronologiei sta doar in chip-urile de sub dale.
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
        [class.tile--compact]="compact()"
        [attr.aria-label]="accessibleName()"
        (click)="log.emit(summary().type)"
      >
        <span class="tile__block" [class.tile__block--breathe]="breathe()">
          <app-icon [name]="meta().icon" [size]="compact() ? 18 : 20" />
        </span>
        <span class="tile__label">{{ meta().label }}</span>
        @if (compact()) {
          <!-- Randul tipurilor rare: doar cand a fost ultima data; restul e in formular. -->
          @if (summary().last; as last) {
            <time class="tile__meta tabular-nums" [attr.datetime]="last.occurredAt">{{ time() }}</time>
          }
        } @else {
          @if (asleep()) {
            <span class="tile__when">Doarme acum</span>
            <span class="tile__meta">Atinge când s-a trezit</span>
          } @else if (summary().last; as last) {
            <span class="tile__when">{{ relative() }}</span>
            <span class="tile__meta">
              <time class="tabular-nums" [attr.datetime]="last.occurredAt">{{ time() }}</time>
              <span aria-hidden="true">·</span>
              <span>{{ summary().count ? count() : 'încă nimic azi' }}</span>
              @if (total()) {
                <span aria-hidden="true">·</span>
                <span class="tile__total tabular-nums">{{ total() }}</span>
              }
            </span>
          } @else {
            <span class="tile__when tile__when--none">Încă nimic azi</span>
            <span class="tile__meta">{{ copy().add }}</span>
          }
          <!-- Semnul ca randul noteaza, nu doar arata: acelasi ＋ ca butonul Adaugă. -->
          @if (!asleep()) {
            <app-icon class="tile__plus" name="plus" [size]="20" />
          }
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

    /* Un rand pe doua linii: "Masă ... acum 25 de minute" / "14:45 · 3 mese".
       "Cand" sta aliniat la dreapta pe toate randurile: la 3 noaptea se citeste ca o coloana. */
    .tile {
      display: grid;
      grid-template-areas:
        'block label when plus'
        'block meta meta plus';
      /* Coloana ＋ ramane si cand lipseste (Somn, cat doarme): "cand" sta aliniat. */
      grid-template-columns: auto auto minmax(0, 1fr) 1.25rem;
      align-content: center;
      align-items: baseline;
      gap: 2px var(--space-3);
      width: 100%;
      height: 100%;
      min-height: 4.25rem;
      padding: var(--space-3) var(--space-4) var(--space-3) var(--space-3);
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

    /* Tipurile rare: o pastila pe jumatate de rand, eticheta + ora ultimei. */
    .tile--compact {
      grid-template-areas:
        'block label'
        'block meta';
      grid-template-columns: auto minmax(0, 1fr);
      gap: 0 var(--space-2);
      min-height: var(--tap-min);
      padding: var(--space-2) var(--space-3);
    }

    /* Fara ora (tipul n-a fost notat niciodata): eticheta centrata langa cub. */
    .tile--compact:not(:has(.tile__meta)) {
      grid-template-areas: 'block label';
    }

    /* Cubul de lemn al tipului, acelasi ca in selectorul de activitati. */
    .tile__block {
      @include m.block;

      display: grid;
      grid-area: block;
      place-items: center;
      align-self: center;
      width: 2.25rem;
      height: 2.25rem;
      color: var(--block-ink);
    }

    .tile--compact .tile__block {
      width: 1.75rem;
      height: 1.75rem;
    }

    .tile__block--breathe {
      animation: breathe calc(var(--dur-slow) * 2) var(--ease-settle);
    }

    @keyframes breathe {
      50% {
        transform: scale(1.12);
      }
    }

    /* Etichetele nu se rup in mijlocul cuvantului; la nevoie, "Medicam…" pe tot cuvantul. */
    .tile__label {
      grid-area: label;
      overflow: hidden;
      min-width: 0;
      color: var(--color-text-strong);
      font-weight: 700;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .tile__when {
      grid-area: when;
      color: var(--color-text-strong);
      font-size: var(--text-lead);
      font-weight: 800;
      line-height: 1.25;
      text-align: end;
    }

    .tile__when--none {
      font-size: var(--text-body);
      font-weight: 700;
    }

    .tile__plus {
      grid-area: plus;
      align-self: center;
      color: var(--block-ink);
    }

    .tile__meta {
      display: flex;
      flex-wrap: wrap;
      grid-area: meta;
      gap: 0 var(--space-1);
      color: var(--block-ink);
      font-size: var(--text-small);
      font-weight: 600;
    }

    .tile__total {
      color: var(--color-text-strong);
      font-weight: 800;
    }
  `,
})
export class SummaryTile {
  readonly summary = input.required<TypeSummary>();
  readonly now = input.required<Date>();
  /** Doar pe dala Somn: bebelusul doarme acum, deci apasarea noteaza trezirea. */
  readonly asleep = input(false, { transform: booleanAttribute });
  /** Pastila mica pentru tipurile rare: eticheta si ora ultimei, fara numaratoare. */
  readonly compact = input(false, { transform: booleanAttribute });
  /**
   * Tocmai s-a notat o activitate de acest tip: cubul "respira" o data (BP-UI-18,
   * mica bucurie de dupa un Somn notat). Sub `prefers-reduced-motion` animatia e
   * oprita global, din _base.scss.
   */
  readonly breathe = input(false, { transform: booleanAttribute });

  /** Orice apasare: noteaza o activitate de acest tip. */
  readonly log = output<ActivityType>();

  protected readonly meta = computed(() => ACTIVITY_META[this.summary().type]);
  protected readonly copy = computed(() => ACTIVITY_META[this.summary().type].copy);

  protected readonly relative = computed(() => {
    const last = this.summary().last;
    return last ? relativeLabel(last.occurredAt, this.now()) : '';
  });

  /** "23:40" azi; "ieri, 23:40" sau "joi, 18 septembrie, 23:40" pentru o zi trecuta. */
  protected readonly time = computed(() => {
    const last = this.summary().last;
    if (!last) {
      return '';
    }
    const time = timeLabel(last.occurredAt);
    return this.lastIsToday() ? time : `${dayHeader(last.occurredAt, this.now()).toLocaleLowerCase('ro')}, ${time}`;
  });

  private readonly lastIsToday = computed(() => {
    const last = this.summary().last;
    return !!last && isSameLocalDay(new Date(last.occurredAt), this.now());
  });

  protected readonly count = computed(() =>
    countLabel(this.summary().count, ACTIVITY_NOUN[this.summary().type]),
  );

  /**
   * "540 ml azi", "9 h 40 min azi", "210 ml · 25 min azi" — doar din campurile
   * structurate (BP-UI-20). Fara nimic masurat, nu aratam nimic (niciun "0 ml").
   */
  protected readonly total = computed(() => {
    const { totalMl, totalMinutes } = this.summary();
    const parts = [
      totalMl === undefined ? '' : `${totalMl} ml`,
      totalMinutes === undefined ? '' : durationLabel(totalMinutes),
    ].filter(Boolean);
    return parts.length ? `${parts.join(' · ')} azi` : '';
  });

  /** O propozitie intreaga pentru cititorul de ecran; incepe cu eticheta vizibila. */
  protected readonly accessibleName = computed(() => {
    const label = this.meta().label;
    const total = this.total() ? `, în total ${this.total()}` : '';
    const { last, count } = this.summary();
    if (this.asleep()) {
      return `${label}: doarme acum. Notează trezirea.`;
    }
    if (!last) {
      return `${label}: încă nimic azi. ${this.copy().add}`;
    }
    const today = count ? `${this.count()} azi${total}` : 'încă nimic azi';
    const at = this.lastIsToday() ? `la ${this.time()}` : this.time();
    return `${label}: ultima ${this.relative()}, ${at}, ${today}. ${this.copy().add}`;
  });
}
