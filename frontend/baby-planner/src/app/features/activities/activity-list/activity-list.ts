import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Lista activitatilor unui bebelus.
 *
 * `babyId` vine din segmentul `:babyId` al rutei: cu `withComponentInputBinding()`
 * activat in app.config.ts, routerul leaga parametrii de ruta direct de `input()`-uri.
 * Nu mai e nevoie sa ne abonam la ActivatedRoute.
 */
@Component({
  selector: 'app-activity-list',
  imports: [RouterLink],
  styleUrl: './activity-list.scss',
  templateUrl: './activity-list.html',
})
export class ActivityList {
  readonly babyId = input.required<string>();
}
