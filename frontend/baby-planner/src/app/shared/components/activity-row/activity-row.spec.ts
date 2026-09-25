import { TestBed } from '@angular/core/testing';

import { Activity } from '../../../core/models/activity';
import { ActivityRow } from './activity-row';

// 13:04 UTC = 16:04 ora Romaniei in septembrie; testele ruleaza cu TZ-ul masinii,
// deci verificam doar forma ("HH:MM"), nu ora exacta.
const FEEDING: Activity = {
  id: 7,
  babyId: 1,
  type: 'Feeding',
  occurredAt: '2026-09-25T13:04:00+00:00',
  notes: '120 ml lapte praf',
};

describe('ActivityRow', () => {
  async function render(activity: Activity) {
    const fixture = TestBed.createComponent(ActivityRow);
    fixture.componentRef.setInput('activity', activity);
    await fixture.whenStable();
    return fixture;
  }

  it('leads with the time and shows the notes as primary text', async () => {
    const fixture = await render(FEEDING);
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('time')?.textContent?.trim()).toMatch(/^\d{2}:\d{2}$/);
    expect(el.querySelector('time')?.getAttribute('datetime')).toBe(FEEDING.occurredAt);
    expect(el.querySelector('.activity-row__primary')?.textContent).toBe('120 ml lapte praf');
    expect(el.querySelector('app-activity-badge')).not.toBeNull();
    expect(el.getAttribute('data-tone')).toBe('feeding');
  });

  it('falls back to the type label when there are no notes, without a duplicate badge', async () => {
    const fixture = await render({ ...FEEDING, type: 'Sleep', notes: null });
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.activity-row__primary')?.textContent).toBe('Somn');
    expect(el.querySelector('app-activity-badge')).toBeNull();
  });

  it('is one button with a full-sentence accessible name', async () => {
    const fixture = await render(FEEDING);
    const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;

    expect(button.getAttribute('aria-label')).toMatch(/^Masă la \d{2}:\d{2}, 120 ml lapte praf\. Editează$/);
  });

  it('emits edit with the activity on click', async () => {
    const fixture = await render(FEEDING);
    const emitted: Activity[] = [];
    fixture.componentInstance.edit.subscribe((a) => emitted.push(a));

    (fixture.nativeElement as HTMLElement).querySelector('button')!.click();

    expect(emitted).toEqual([FEEDING]);
  });
});
