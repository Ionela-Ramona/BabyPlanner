import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { BabyApi } from '../../../core/services/baby-api';

/**
 * Lista bebelusilor.
 *
 * Datele vin prin `rxResource`, care impacheteaza cererea HTTP in semnale:
 * `value()`, `isLoading()`, `error()` si `reload()`. Nu ne abonam manual si nu
 * avem nevoie de `ngOnDestroy` — resursa se opreste odata cu componenta.
 */
@Component({
  selector: 'app-baby-list',
  imports: [DatePipe, RouterLink],
  styleUrl: './baby-list.scss',
  templateUrl: './baby-list.html',
})
export class BabyList {
  private readonly babyApi = inject(BabyApi);

  // `defaultValue` face ca `value()` sa fie mereu un array, si inainte de primul
  // raspuns si dupa o eroare — asa template-ul nu are de tratat `undefined`.
  protected readonly babies = rxResource({
    stream: () => this.babyApi.getAll(),
    defaultValue: [],
  });
}
