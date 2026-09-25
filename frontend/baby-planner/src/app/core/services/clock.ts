import { Service, computed, signal } from '@angular/core';

/**
 * Ceasul aplicatiei: un singur loc care stie cat e ora acum.
 *
 * Componentele si celelalte servicii nu citesc niciodata `new Date()` direct
 * (regula din CLAUDE.md) — injecteaza `Clock` in loc, ca "acum" sa poata fi
 * inghetat in teste. Testele inlocuiesc acest serviciu cu
 * `{ provide: Clock, useValue: ... }`, de obicei prin helperul
 * `provideFakeClock` din `core/testing/fake-clock.ts`, in loc sa astepte
 * minute reale intre assert-uri.
 */
@Service()
export class Clock {
  private readonly nowState = signal(new Date());

  /** Se actualizeaza automat la fiecare minut. */
  readonly now = this.nowState.asReadonly();

  /** Miezul noptii local de azi — folosit pentru "Azi"/"Ieri" si calculul varstei. */
  readonly today = computed(() => {
    const value = this.nowState();
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  });

  constructor() {
    this.scheduleNextTick();
  }

  /**
   * Primul tick e aliniat la inceputul minutului urmator (nu la +60s de la
   * pornirea aplicatiei), ca "acum 5 minute" sa se actualizeze chiar cand
   * trece minutul, nu cu o intarziere aleatoare.
   */
  private scheduleNextTick(): void {
    const now = new Date();
    const msUntilNextMinute = 60_000 - (now.getSeconds() * 1000 + now.getMilliseconds());

    setTimeout(() => {
      this.nowState.set(new Date());
      setInterval(() => this.nowState.set(new Date()), 60_000);
    }, msUntilNextMinute);
  }
}
