import { LiveAnnouncer } from '@angular/cdk/a11y';
import { TestBed } from '@angular/core/testing';

import { ToastOutlet } from './toast-outlet';
import { ToastService } from './toast.service';

describe('ToastOutlet', () => {
  let service: ToastService;
  let fixture: ReturnType<typeof TestBed.createComponent<ToastOutlet>>;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [{ provide: LiveAnnouncer, useValue: { announce: vi.fn().mockResolvedValue(undefined) } }],
    });
    service = TestBed.inject(ToastService);
    fixture = TestBed.createComponent(ToastOutlet);
  });

  afterEach(() => vi.useRealTimers());

  it('renders nothing when the queue is empty', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.toast')).toBeNull();
  });

  it('renders the current toast with its tone and action', () => {
    const run = vi.fn();
    service.show({ message: 'Masă înregistrată', tone: 'success', action: { label: 'Anulează', run } });
    fixture.detectChanges();

    const toast = fixture.nativeElement.querySelector('.toast');
    expect(toast.getAttribute('data-tone')).toBe('success');
    expect(toast.textContent).toContain('Masă înregistrată');

    const buttons: HTMLButtonElement[] = Array.from(toast.querySelectorAll('button'));
    const actionButton = buttons.find((button) => button.textContent?.includes('Anulează')) as HTMLButtonElement;
    actionButton.click();

    expect(run).toHaveBeenCalled();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.toast')).toBeNull();
  });

  it('pauses the timer while the pointer is over the toast', () => {
    service.show({ message: 'Se anunță', duration: 1000 });
    fixture.detectChanges();

    fixture.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(5000);
    expect(service.current()).not.toBeNull();

    fixture.nativeElement.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(1000);
    expect(service.current()).toBeNull();
  });
});
