import { DestroyRef, ElementRef, Signal, afterNextRender, inject, signal } from '@angular/core';

export interface BoxSize {
  readonly width: number;
  readonly height: number;
}

/**
 * Marimea reala (border-box) a elementului gazda, ca semnal.
 *
 * Formele desenate in SVG au nevoie de pixeli: o cusatura calculata pe marimea
 * reala are liniute identice la 40px si la 320px, iar norul-bula isi adauga lobi
 * cand textul il lateste, in loc sa se intinda ca o poza deformata.
 * Se cheama din contextul de injectie al componentei (initializarea unui camp).
 * Fara ResizeObserver (teste, SSR) ramane `null`, iar componenta foloseste o marime implicita.
 */
export function hostSize(): Signal<BoxSize | null> {
  const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  const destroyRef = inject(DestroyRef);
  const size = signal<BoxSize | null>(null, {
    equal: (a, b) => a?.width === b?.width && a?.height === b?.height,
  });

  afterNextRender(() => {
    if (typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      const box = entry.borderBoxSize?.[0];
      size.set(
        box
          ? { width: box.inlineSize, height: box.blockSize }
          : { width: host.offsetWidth, height: host.offsetHeight },
      );
    });
    observer.observe(host);
    destroyRef.onDestroy(() => observer.disconnect());
  });

  return size.asReadonly();
}
