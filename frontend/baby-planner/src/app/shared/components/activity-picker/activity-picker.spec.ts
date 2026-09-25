import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { ACTIVITY_META, ACTIVITY_TYPES } from '../../../core/models/activity-type';
import { ActivityPicker } from './activity-picker';

function keydown(el: Element, key: string): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('ActivityPicker', () => {
  async function setup() {
    await TestBed.configureTestingModule({ imports: [ActivityPicker] }).compileComponents();
    const fixture = TestBed.createComponent(ActivityPicker);
    fixture.detectChanges();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const listbox = root.querySelector('[role="listbox"]') as HTMLElement;
    const options = Array.from(root.querySelectorAll('[role="option"]')) as HTMLElement[];
    return { fixture, listbox, options };
  }

  it('renders a block for every ACTIVITY_META entry (a new type needs only a new entry)', async () => {
    const { options } = await setup();

    expect(options.length).toBe(ACTIVITY_TYPES.length);
    for (const type of ACTIVITY_TYPES) {
      const label = ACTIVITY_META[type].label;
      expect(options.some((option) => option.textContent?.includes(label))).toBe(true);
    }
  });

  it('labels the grid with the default Romanian accessible name', async () => {
    const { listbox } = await setup();
    expect(listbox.getAttribute('aria-label')).toBe('Tip activitate');
  });

  it('starts with nothing selected', async () => {
    const { fixture, options } = await setup();

    expect(fixture.componentInstance.value()).toBeUndefined();
    expect(options.every((option) => option.getAttribute('aria-selected') === 'false')).toBe(true);
  });

  it('moves the active block with arrow keys without selecting or emitting picked', async () => {
    const { fixture, listbox, options } = await setup();
    const picked = vi.fn();
    fixture.componentInstance.picked.subscribe(picked);

    keydown(listbox, 'ArrowRight');
    fixture.detectChanges();

    expect(options[1].getAttribute('data-active')).toBe('true');
    expect(options[1].getAttribute('aria-selected')).toBe('false');
    expect(fixture.componentInstance.value()).toBeUndefined();
    expect(picked).not.toHaveBeenCalled();
  });

  it('selects and emits picked on Enter', async () => {
    const { fixture, listbox, options } = await setup();
    const picked = vi.fn();
    fixture.componentInstance.picked.subscribe(picked);

    keydown(listbox, 'ArrowRight'); // Feeding -> Sleep
    keydown(listbox, 'Enter');
    fixture.detectChanges();

    expect(options[1].getAttribute('aria-selected')).toBe('true');
    expect(fixture.componentInstance.value()).toBe('Sleep');
    expect(picked).toHaveBeenCalledWith('Sleep');
  });

  it('selects and emits picked on Space', async () => {
    const { fixture, listbox, options } = await setup();
    const picked = vi.fn();
    fixture.componentInstance.picked.subscribe(picked);

    keydown(listbox, ' ');
    fixture.detectChanges();

    expect(options[0].getAttribute('aria-selected')).toBe('true');
    expect(fixture.componentInstance.value()).toBe('Feeding');
    expect(picked).toHaveBeenCalledWith('Feeding');
  });

  it('supports Home and End', async () => {
    const { fixture, listbox, options } = await setup();

    keydown(listbox, 'End');
    fixture.detectChanges();
    expect(options[options.length - 1].getAttribute('data-active')).toBe('true');

    keydown(listbox, 'Home');
    fixture.detectChanges();
    expect(options[0].getAttribute('data-active')).toBe('true');
  });

  it('selects on click', async () => {
    const { fixture, options } = await setup();
    const picked = vi.fn();
    fixture.componentInstance.picked.subscribe(picked);

    options[2].dispatchEvent(new PointerEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe('Diaper');
    expect(picked).toHaveBeenCalledWith('Diaper');
  });

  it('writes an external value onto the listbox selection', async () => {
    const { fixture, options } = await setup();

    fixture.componentRef.setInput('value', 'Medicine');
    fixture.detectChanges();
    await fixture.whenStable();

    const medicineOption = options.find((option) => option.textContent?.includes('Medicamente'));
    expect(medicineOption?.getAttribute('aria-selected')).toBe('true');
  });
});
