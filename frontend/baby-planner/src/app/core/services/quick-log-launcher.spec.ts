import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { Activity } from '../models/activity';
import { Baby } from '../models/baby';
import { SheetService } from '../../shared/overlays/sheet.service';
import { ActiveBaby } from './active-baby';
import { QuickLogLauncher } from './quick-log-launcher';

const maria: Baby = { id: 1, name: 'Maria', dateOfBirth: '2026-03-24' };
const ion: Baby = { id: 2, name: 'Ion', dateOfBirth: '2025-12-01' };

describe('QuickLogLauncher', () => {
  let open: ReturnType<typeof vi.fn>;
  let navigateByUrl: ReturnType<typeof vi.spyOn>;
  const babies = signal<Baby[]>([]);
  const activeBaby = signal<Baby | undefined>(undefined);

  beforeEach(() => {
    babies.set([maria, ion]);
    activeBaby.set(maria);
    open = vi.fn().mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: SheetService, useValue: { open } },
        { provide: ActiveBaby, useValue: { babies, activeBaby } },
      ],
    });
    navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  });

  const launcher = () => TestBed.inject(QuickLogLauncher);
  const data = () => open.mock.calls[0][1].data;

  it('opens the quick cubes for the active baby', async () => {
    await launcher().open();

    expect(data()).toEqual({ mode: 'quick', babyId: 1, babyName: 'Maria', type: undefined });
    expect(open.mock.calls[0][1].ariaLabelledBy).toBe('quick-log-title');
  });

  it('jumps straight to the form when a type is chosen', async () => {
    await launcher().open('Medicine');

    expect(data()).toEqual(expect.objectContaining({ mode: 'details', type: 'Medicine' }));
  });

  it('opens the full form for a new activity', async () => {
    await launcher().openDetails();

    expect(data()).toEqual(expect.objectContaining({ mode: 'details', babyId: 1 }));
  });

  it('edits an activity for its own baby, not the active one', async () => {
    const activity: Activity = { id: 9, babyId: 2, type: 'Sleep', occurredAt: '2026-09-25T08:00:00Z', notes: null };

    await launcher().edit(activity);

    expect(data()).toEqual({ mode: 'edit', babyId: 2, babyName: 'Ion', type: 'Sleep', activity });
  });

  it('sends to /welcome when there is no baby to log for', async () => {
    activeBaby.set(undefined);

    await launcher().open();

    expect(open).not.toHaveBeenCalled();
    expect(navigateByUrl).toHaveBeenCalledWith('/welcome');
  });
});
