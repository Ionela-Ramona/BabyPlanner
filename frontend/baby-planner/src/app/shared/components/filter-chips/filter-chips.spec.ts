import { TestBed } from '@angular/core/testing';

import { ACTIVITY_META, ACTIVITY_TYPES } from '../../../core/models/activity-type';
import { FilterChips } from './filter-chips';

function keydown(el: Element, key: string): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('FilterChips', () => {
  async function setup() {
    await TestBed.configureTestingModule({ imports: [FilterChips] }).compileComponents();
    const fixture = TestBed.createComponent(FilterChips);
    fixture.detectChanges();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const listbox = root.querySelector('[role="listbox"]') as HTMLElement;
    const chips = Array.from(root.querySelectorAll('[role="option"]')) as HTMLElement[];
    return { fixture, listbox, chips };
  }

  it('renders "Toate" plus a chip for every ACTIVITY_META entry', async () => {
    const { chips } = await setup();

    expect(chips.length).toBe(ACTIVITY_TYPES.length + 1);
    expect(chips[0].textContent).toContain('Toate');
    for (const type of ACTIVITY_TYPES) {
      const label = ACTIVITY_META[type].label;
      expect(chips.some((chip) => chip.textContent?.includes(label))).toBe(true);
    }
  });

  it('has the default Romanian accessible name', async () => {
    const { listbox } = await setup();
    expect(listbox.getAttribute('aria-label')).toBe('Filtrează după tip');
  });

  it('selects "Toate" (undefined) by default', async () => {
    const { fixture, chips } = await setup();

    expect(fixture.componentInstance.value()).toBeUndefined();
    expect(chips[0].getAttribute('aria-selected')).toBe('true');
  });

  it('writes the model when a chip is clicked', async () => {
    const { fixture, chips } = await setup();
    const sleepChip = chips.find((chip) => chip.textContent?.includes('Somn'))!;

    sleepChip.dispatchEvent(new PointerEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe('Sleep');
    expect(sleepChip.getAttribute('aria-selected')).toBe('true');
    expect(chips[0].getAttribute('aria-selected')).toBe('false');
  });

  it('follows arrow-key focus, like a radiogroup', async () => {
    const { fixture, listbox } = await setup();

    keydown(listbox, 'ArrowRight'); // Toate -> Masă
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe('Feeding');
  });

  it('reflects an externally written value', async () => {
    const { fixture, chips } = await setup();

    fixture.componentRef.setInput('value', 'Diaper');
    fixture.detectChanges();
    await fixture.whenStable();

    const diaperChip = chips.find((chip) => chip.textContent?.includes('Scutec'));
    expect(diaperChip?.getAttribute('aria-selected')).toBe('true');
  });
});
