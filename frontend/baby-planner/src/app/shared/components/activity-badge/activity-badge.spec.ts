import { TestBed } from '@angular/core/testing';

import { ACTIVITY_META, ACTIVITY_TYPES, ActivityType } from '../../../core/models/activity-type';
import { ActivityBadge } from './activity-badge';

describe('ActivityBadge', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ActivityBadge] }).compileComponents();
  });

  function render(type: ActivityType) {
    const fixture = TestBed.createComponent(ActivityBadge);
    fixture.componentRef.setInput('type', type);
    fixture.detectChanges();
    return fixture;
  }

  it('shows the icon and label for every ACTIVITY_META entry', () => {
    for (const type of ACTIVITY_TYPES) {
      const fixture = render(type);
      const host = fixture.nativeElement as HTMLElement;

      expect(host.textContent).toContain(ACTIVITY_META[type].label);
      expect(host.getAttribute('data-tone')).toBe(ACTIVITY_META[type].tone);
      expect(host.querySelector('svg use')?.getAttribute('href')).toContain(
        ACTIVITY_META[type].icon,
      );
    }
  });

  it('hides the label visually, but keeps it for screen readers, when iconOnly', () => {
    const fixture = render('Feeding');
    fixture.componentRef.setInput('iconOnly', true);
    fixture.detectChanges();

    const label = (fixture.nativeElement as HTMLElement).querySelector('span');
    expect(label?.classList.contains('visually-hidden')).toBe(true);
    expect(label?.textContent).toBe('Masă');
  });
});
