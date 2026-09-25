import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Baby } from '../models/baby';
import { ACTIVE_BABY_STORAGE_KEY, ActiveBaby } from './active-baby';

const babies: Baby[] = [
  { id: 2, name: 'Radu', dateOfBirth: '2025-01-01' },
  { id: 5, name: 'Maria', dateOfBirth: '2026-03-24' },
];

describe('ActiveBaby', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // rxResource carga async (chiar daca raspunsul HTTP e sincron, prin
  // HttpTestingController): trebuie asteptata stabilizarea aplicatiei ca
  // semnalele resursei sa se fi actualizat inainte sa citim rezultatul.
  async function settle(): Promise<void> {
    await TestBed.inject(ApplicationRef).whenStable();
  }

  /** Injecteaza serviciul, forteaza incarcarea si raspunde cu lista data. */
  async function load(list: Baby[] = babies): Promise<ActiveBaby> {
    const service = TestBed.inject(ActiveBaby);
    TestBed.tick();
    httpMock.expectOne('/api/babies').flush(list);
    await settle();
    return service;
  }

  it('falls back to the first baby when nothing is stored', async () => {
    const service = await load();

    expect(service.activeId()).toBe(2);
    expect(service.activeBaby()?.name).toBe('Radu');
    expect(service.hasBabies()).toBe(true);
  });

  it('remembers the selected baby for the next visit', async () => {
    const service = await load();

    service.select(5);

    expect(service.activeId()).toBe(5);
    expect(service.activeBaby()?.name).toBe('Maria');
    expect(localStorage.getItem(ACTIVE_BABY_STORAGE_KEY)).toBe('5');
  });

  it('restores a previously selected baby on startup', async () => {
    localStorage.setItem(ACTIVE_BABY_STORAGE_KEY, '5');

    const service = await load();

    expect(service.activeId()).toBe(5);
  });

  it('ignores a stored id that no longer exists in the list', async () => {
    localStorage.setItem(ACTIVE_BABY_STORAGE_KEY, '999');

    const service = await load();

    expect(service.activeId()).toBe(2);
  });

  it('reports hasBabies as undefined until the first load resolves', async () => {
    const service = TestBed.inject(ActiveBaby);

    expect(service.hasBabies()).toBeUndefined();

    TestBed.tick();
    httpMock.expectOne('/api/babies').flush(babies);
    await settle();

    expect(service.hasBabies()).toBe(true);
  });

  it('reports hasBabies as false and activeId as undefined for an empty list', async () => {
    const service = await load([]);

    expect(service.hasBabies()).toBe(false);
    expect(service.activeId()).toBeUndefined();
    expect(service.activeBaby()).toBeUndefined();
  });

  it('survives localStorage throwing on read and write', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked (private browsing)');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked (private browsing)');
    });

    try {
      const service = await load();

      expect(service.activeId()).toBe(2);
      expect(() => service.select(5)).not.toThrow();
      expect(service.activeId()).toBe(5);
    } finally {
      vi.restoreAllMocks();
    }
  });

  it('reload() triggers a fresh request', async () => {
    const service = await load();

    service.reload();
    TestBed.tick();

    httpMock.expectOne('/api/babies').flush(babies);
    await settle();
  });
});
