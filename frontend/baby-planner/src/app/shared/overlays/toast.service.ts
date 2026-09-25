import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Service, computed, inject, signal } from '@angular/core';

export type ToastTone = 'success' | 'info' | 'danger';

export interface ToastAction {
  label: string;
  run: () => void;
}

export interface ToastOptions {
  message: string;
  tone?: ToastTone;
  action?: ToastAction;
  secondaryAction?: ToastAction;
  /** Milisecunde pana la inchiderea automata. Implicit 5000. */
  duration?: number;
}

export interface ToastHandle {
  dismiss(): void;
}

export interface ToastEntry {
  readonly id: number;
  readonly message: string;
  readonly tone: ToastTone;
  readonly action?: ToastAction;
  readonly secondaryAction?: ToastAction;
}

const DEFAULT_DURATION_MS = 5000;

/**
 * Coada de toasturi: un singur toast vizibil, restul asteapta. Textul e anuntat
 * politicos prin `LiveAnnouncer` (regiunea lui, separata de cardul vizual, ca
 * mesajul sa nu fie citit de doua ori); focusul nu se muta niciodata singur.
 *
 * Temporizatorul se opreste la hover/focus (vezi `ToastOutlet`, care apeleaza
 * `pause`/`resume`) si reporneste cu timpul ramas, nu de la zero.
 */
@Service()
export class ToastService {
  private readonly announcer = inject(LiveAnnouncer);

  private readonly queueState = signal<ToastEntry[]>([]);
  /** Toasturile din coada, primul fiind cel vizibil. */
  readonly queue = this.queueState.asReadonly();
  /** Toastul vizibil in acest moment, sau `null`. */
  readonly current = computed(() => this.queueState()[0] ?? null);

  private nextId = 0;
  private readonly durations = new Map<number, number>();
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private remainingMs = 0;
  private startedAt = 0;

  show(options: ToastOptions): ToastHandle {
    const id = ++this.nextId;
    const entry: ToastEntry = {
      id,
      message: options.message,
      tone: options.tone ?? 'info',
      action: options.action,
      secondaryAction: options.secondaryAction,
    };
    this.durations.set(id, options.duration ?? DEFAULT_DURATION_MS);

    const wasEmpty = this.queueState().length === 0;
    this.queueState.update((queue) => [...queue, entry]);
    if (wasEmpty) {
      this.announceAndStart(entry);
    }

    return { dismiss: () => this.dismiss(id) };
  }

  dismiss(id: number): void {
    const isCurrent = this.queueState()[0]?.id === id;
    this.durations.delete(id);
    this.queueState.update((queue) => queue.filter((toast) => toast.id !== id));

    if (!isCurrent) {
      return;
    }
    this.clearTimer();
    const next = this.current();
    if (next) {
      this.announceAndStart(next);
    }
  }

  /** Pune pauza temporizatorului curent (hover sau focus in interiorul toast-ului). */
  pause(): void {
    if (this.timeoutId === null) {
      return;
    }
    clearTimeout(this.timeoutId);
    this.timeoutId = null;
    this.remainingMs = Math.max(0, this.remainingMs - (Date.now() - this.startedAt));
  }

  /** Reporneste temporizatorul cu timpul ramas dupa pauza. */
  resume(): void {
    if (this.timeoutId !== null || this.remainingMs <= 0) {
      return;
    }
    const current = this.current();
    if (!current) {
      return;
    }
    this.startedAt = Date.now();
    this.timeoutId = setTimeout(() => this.dismiss(current.id), this.remainingMs);
  }

  private announceAndStart(entry: ToastEntry): void {
    void this.announcer.announce(entry.message, 'polite');
    this.remainingMs = this.durations.get(entry.id) ?? DEFAULT_DURATION_MS;
    this.startedAt = Date.now();
    this.clearTimer();
    this.timeoutId = setTimeout(() => this.dismiss(entry.id), this.remainingMs);
  }

  private clearTimer(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
