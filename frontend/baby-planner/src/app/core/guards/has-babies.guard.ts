import { computed, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';

import { ActiveBaby } from '../services/active-baby';

/**
 * Pe `/dashboard`: fara niciun bebelus nu avem ce arata, deci trimitem la
 * prima pornire (`/welcome`).
 *
 * Asteptam lista (nu decidem pe "inca se incarca"), inclusiv o reincarcare in
 * curs: dupa "Adaugă bebelușul" pe /welcome, lista veche (goala) nu trebuie sa
 * ne trimita inapoi. La eroare lasam pagina sa se deschida: ea arata starea de
 * eroare cu "Reîncearcă", nu un formular de adaugare inutil.
 */
export const hasBabiesGuard: CanActivateFn = () => {
  const active = inject(ActiveBaby);
  const router = inject(Router);

  // error() primul: in starea de eroare `hasBabies()` (lista) arunca.
  const decision = computed<boolean | 'redirect' | undefined>(() => {
    if (active.error()) {
      return true;
    }
    if (active.isLoading()) {
      return undefined;
    }
    const hasBabies = active.hasBabies();
    return hasBabies === undefined ? undefined : hasBabies || 'redirect';
  });

  return toObservable(decision).pipe(
    filter((value) => value !== undefined),
    take(1),
    map((value) => (value === 'redirect' ? router.createUrlTree(['/welcome']) : true)),
  );
};
