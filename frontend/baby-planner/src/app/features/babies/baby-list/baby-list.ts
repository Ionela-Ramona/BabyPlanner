import { Component, VERSION, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ActiveBaby } from '../../../core/services/active-baby';
import { Clock } from '../../../core/services/clock';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { Button } from '../../../shared/components/button/button';
import { Card } from '../../../shared/components/card/card';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { Icon } from '../../../shared/components/icon/icon';
import { Skeleton } from '../../../shared/components/skeleton/skeleton';
import { ageLabel } from '../../../shared/utils/ro-time';
import { birthDateLabel } from '../baby-format';

/**
 * Lista bebelusilor.
 *
 * Citeste lista comuna din `ActiveBaby` (aceeasi pe care o foloseste selectorul
 * din bara de sus), nu face o cerere proprie: dupa o adaugare sau o stergere,
 * un singur `reload()` actualizeaza ambele locuri.
 */
@Component({
  selector: 'app-baby-list',
  imports: [Avatar, Button, Card, EmptyState, ErrorState, Icon, RouterLink, Skeleton],
  styleUrl: './baby-list.scss',
  templateUrl: './baby-list.html',
})
export class BabyList {
  protected readonly active = inject(ActiveBaby);
  private readonly clock = inject(Clock);

  protected readonly angularVersion = VERSION.major;

  /**
   * Cardurile gata de afisat. `babies()` arunca in starea de eroare (asa face
   * rxResource), deci template-ul verifica `error()` inainte sa ajunga aici.
   */
  protected readonly cards = computed(() => {
    const today = this.clock.today();
    return this.active.babies().map((baby) => ({
      id: baby.id,
      name: baby.name,
      age: ageLabel(baby.dateOfBirth, today),
      birthDate: birthDateLabel(baby.dateOfBirth),
    }));
  });
}
