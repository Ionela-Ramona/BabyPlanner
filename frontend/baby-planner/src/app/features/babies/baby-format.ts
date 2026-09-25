import { Injector } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, firstValueFrom } from 'rxjs';

import { ActiveBaby } from '../../core/services/active-baby';
import { parseDateOnly } from '../../shared/utils/ro-time';

const BIRTH_DATE_FORMATTER = new Intl.DateTimeFormat('ro', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** "2026-03-25" -> "25 martie 2026". Data e calendaristica (DateOnly), deci o citim local, nu UTC. */
export function birthDateLabel(dateOfBirth: string): string {
  return BIRTH_DATE_FORMATTER.format(parseDateOnly(dateOfBirth));
}

/** Primele litere ale primelor doua cuvinte ("Ana Maria" -> "AM"), ca in app-avatar. */
export function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

/** Un `Date` local ca "YYYY-MM-DD", formatul lui `<input type="date">` si al API-ului. */
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Reincarca lista de bebelusi si asteapta sa se termine.
 *
 * Dupa o stergere nu navigam pana nu avem lista noua: altfel pagina Bebeluși ar
 * arata o clipa bebelusul sters, iar alegerea "mai exista bebelusi?" s-ar face
 * pe date vechi.
 */
export async function reloadBabies(active: ActiveBaby, injector: Injector): Promise<void> {
  active.reload();
  await firstValueFrom(
    toObservable(active.isLoading, { injector }).pipe(filter((loading) => !loading)),
  );
}
