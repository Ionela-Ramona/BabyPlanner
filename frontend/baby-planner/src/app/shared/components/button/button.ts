import { Directive, booleanAttribute, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'lg';

/**
 * Familia de butoane, ca directiva pe elementele native: `<button appButton>` pentru
 * actiuni, `<a appButton routerLink>` pentru navigare. Nu e o componenta-wrapper, ca
 * formularele, focusul si routerLink sa functioneze exact ca pe elementul nativ.
 *
 * Stilurile sunt globale (`styles/_buttons.scss`): o directiva nu are stiluri proprii,
 * iar asa fiecare componenta ramane sub bugetul de 4 kB.
 *
 * `loading`: pastreaza latimea butonului, arata un spinner si seteaza `aria-busy`.
 * Pe `<button>` il si dezactiveaza, ca un dublu-tap sa nu trimita de doua ori.
 */
@Directive({
  selector: 'button[appButton], a[appButton]',
  host: {
    class: 'btn',
    '[class.btn--primary]': "variant() === 'primary'",
    '[class.btn--secondary]': "variant() === 'secondary'",
    '[class.btn--ghost]': "variant() === 'ghost'",
    '[class.btn--danger]': "variant() === 'danger'",
    '[class.btn--lg]': "size() === 'lg'",
    '[class.btn--block]': 'block()',
    '[class.btn--loading]': 'loading()',
    '[attr.aria-busy]': "loading() ? 'true' : null",
    '[attr.data-loading]': "loading() ? '' : null",
  },
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly block = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
}
