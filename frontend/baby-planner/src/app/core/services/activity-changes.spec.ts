import { TestBed } from '@angular/core/testing';

import { ActivityChanges } from './activity-changes';

describe('ActivityChanges', () => {
  it('starts at version 0', () => {
    const changes = TestBed.inject(ActivityChanges);
    expect(changes.version()).toBe(0);
  });

  it('increments the version on every notify()', () => {
    const changes = TestBed.inject(ActivityChanges);

    changes.notify();
    expect(changes.version()).toBe(1);

    changes.notify();
    changes.notify();
    expect(changes.version()).toBe(3);
  });
});
