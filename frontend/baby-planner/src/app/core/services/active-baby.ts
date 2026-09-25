import { Service, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { Baby } from '../models/baby';
import { BabyApi } from './baby-api';

/** Cheia din localStorage sub care retinem bebelusul ales ultima data. */
export const ACTIVE_BABY_STORAGE_KEY = 'bp-active-baby';

/**
 * Bebelusul activ al aplicatiei: cine e selectat in bara de sus si pentru cine
 * se incarca Azi/Istoric.
 *
 * Lista de bebelusi e sursa de adevar, nu localStorage: daca id-ul retinut nu
 * mai exista in lista (bebelus sters, alt profil de browser), cadem pe primul
 * bebelus din lista in loc sa aratam un ecran gol. O ruta cu `:babyId` (Istoric,
 * profil) poate suprascrie alegerea apeland `select(id)` din componenta.
 */
@Service()
export class ActiveBaby {
  private readonly babyApi = inject(BabyApi);

  private readonly selectedId = signal<number | undefined>(this.readStored());

  private readonly resource = rxResource({
    stream: () => this.babyApi.getAll(),
    defaultValue: [] as Baby[],
  });

  // `computed`, nu expunem direct `resource.value` (e un WritableSignal) —
  // nimeni din afara nu trebuie sa poata rescrie lista de bebelusi direct.
  readonly babies = computed(() => this.resource.value());
  readonly isLoading = this.resource.isLoading;
  readonly error = this.resource.error;

  /**
   * `undefined` cat timp prima incarcare n-a terminat inca — asa componentele
   * pot arata un skeleton in loc sa clipeasca spre "Adauga un bebelus" inainte
   * sa afle ca de fapt exista unul.
   */
  readonly hasBabies = computed<boolean | undefined>(() => {
    const status = this.resource.status();
    if (status === 'idle' || status === 'loading') {
      return undefined;
    }
    return this.babies().length > 0;
  });

  readonly activeId = computed<number | undefined>(() => {
    const babies = this.babies();
    if (babies.length === 0) {
      return undefined;
    }
    const stored = this.selectedId();
    const storedExists = stored !== undefined && babies.some((baby) => baby.id === stored);
    return storedExists ? stored : babies[0].id;
  });

  readonly activeBaby = computed<Baby | undefined>(() => {
    const id = this.activeId();
    return id === undefined ? undefined : this.babies().find((baby) => baby.id === id);
  });

  /** Schimba bebelusul activ si retine alegerea pentru urmatoarea vizita. */
  select(id: number): void {
    this.selectedId.set(id);
    try {
      localStorage.setItem(ACTIVE_BABY_STORAGE_KEY, String(id));
    } catch {
      // Stocarea poate fi blocata (mod privat); selectia ramane valabila pentru sesiunea curenta.
    }
  }

  reload(): void {
    this.resource.reload();
  }

  private readStored(): number | undefined {
    try {
      const raw = localStorage.getItem(ACTIVE_BABY_STORAGE_KEY);
      if (raw === null) {
        return undefined;
      }
      const parsed = Number(raw);
      return Number.isInteger(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }
}
