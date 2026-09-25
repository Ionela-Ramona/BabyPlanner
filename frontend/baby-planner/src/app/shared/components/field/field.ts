import { Component, Directive, computed, inject, input } from '@angular/core';

import { Icon } from '../icon/icon';
import { IconName } from '../icon/icon-names';

let nextFieldId = 0;

/**
 * Randul "Date: ……" din referinta, dar accesibil: eticheta (cu iconita optionala),
 * un control nativ proiectat si, sub el, un indiciu sau o eroare — niciodata amandoua
 * deodata, ca sa nu sara textul cand apare eroarea.
 *
 * Controlul (`<input>`, `<textarea>`) nu e un `@Input`, ci vine proiectat prin
 * `<ng-content>`: asa raman functionale Signal Forms (`[formField]`), `type="date"`,
 * `placeholder`, etc., exact ca pe un element nativ. Legatura `label for` /
 * `aria-describedby` / `aria-invalid` se face prin directiva `FieldControl` de mai jos,
 * pusa pe control, care citeste id-urile de aici prin DI — apelantul nu repeta id-uri.
 *
 * `error` accepta un singur mesaj sau o lista (Signal Forms poate raporta mai multe
 * erori pe acelasi camp); se afiseaza doar primul, ca sa nu aglomereze randul.
 */
@Component({
  selector: 'app-field',
  imports: [Icon],
  template: `
    <div class="field">
      <label [for]="controlId" class="field__label">
        @if (icon()) {
          <app-icon [name]="icon()!" [size]="18" class="field__icon" />
        }
        {{ label() }}
      </label>

      <div class="field__control">
        <ng-content />
      </div>

      @if (hasError()) {
        <p [id]="errorId" class="field__message field__message--error" role="alert">
          <app-icon name="alert" [size]="16" />
          <span>{{ firstError() }}</span>
        </p>
      } @else if (hint()) {
        <p [id]="hintId" class="field__message field__message--hint">{{ hint() }}</p>
      }
    </div>
  `,
  styles: `
    .field {
      display: grid;
      gap: var(--space-1);
    }

    .field__label {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      color: var(--color-text-muted);
      font-size: var(--text-small);
      font-weight: 600;
    }

    .field__icon {
      color: var(--honey-ink);
    }

    .field__message {
      display: flex;
      align-items: flex-start;
      gap: var(--space-1);
      margin: 0;
      font-size: var(--text-caption);
      line-height: 1.4;
    }

    .field__message--hint {
      color: var(--color-text-muted);
    }

    .field__message--error {
      color: var(--color-danger-ink);
    }

    .field__message--error app-icon {
      flex: none;
      margin-top: 0.125rem;
    }
  `,
})
export class Field {
  /** Obligatoriu: fiecare camp are un nume vizibil, niciodata doar un placeholder. */
  readonly label = input.required<string>();

  /** Iconita din stanga etichetei (ca "📅 Date:" din referinta, dar desenata). */
  readonly icon = input<IconName>();

  /** Indiciu afisat cat timp campul n-are eroare (ex. formatul asteptat). */
  readonly hint = input<string>();

  /** Mesajul (sau lista de mesaje) de eroare curente; `null`/gol = fara eroare. */
  readonly error = input<string | readonly string[] | null | undefined>(null);

  /** Fiecare instanta isi genereaza propriile id-uri, ca sa poata aparea de mai multe ori pe pagina. */
  readonly controlId = `field-${nextFieldId++}`;
  readonly hintId = `${this.controlId}-hint`;
  readonly errorId = `${this.controlId}-error`;

  readonly errorList = computed(() => {
    const value = this.error();
    if (!value) {
      return [];
    }
    return (Array.isArray(value) ? value : [value]).filter((message) => !!message);
  });

  readonly hasError = computed(() => this.errorList().length > 0);
  readonly firstError = computed(() => this.errorList()[0] ?? '');

  /** Folosit de `FieldControl`: eroarea are prioritate fata de indiciu (acelasi rand). */
  readonly describedBy = computed(() => {
    if (this.hasError()) {
      return this.errorId;
    }
    return this.hint() ? this.hintId : null;
  });
}

/**
 * Pusa pe controlul nativ proiectat intr-un `app-field`:
 * `<input appFieldControl>`, `<textarea appFieldControl>`.
 *
 * Citeste `Field` prin DI (functioneaza doar in interiorul unui `<app-field>`) si-i
 * scrie `id`, `aria-describedby` si `aria-invalid`, plus clasa globala `field-control`
 * care poarta stilurile vizuale (linia de baza punctata, focus, stari) din
 * `styles/_fields.scss` — proiectat, controlul nu e atins de encapsularea componentei.
 */
@Directive({
  selector: 'input[appFieldControl], textarea[appFieldControl]',
  host: {
    class: 'field-control',
    '[id]': 'field.controlId',
    '[attr.aria-describedby]': 'field.describedBy()',
    '[attr.aria-invalid]': 'field.hasError() ? "true" : null',
  },
})
export class FieldControl {
  protected readonly field = inject(Field);
}
