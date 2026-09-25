import { TestBed } from '@angular/core/testing';

import { Avatar } from './avatar';

describe('Avatar', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Avatar] }).compileComponents();
  });

  function render(name: string) {
    const fixture = TestBed.createComponent(Avatar);
    fixture.componentRef.setInput('name', name);
    fixture.detectChanges();
    return fixture;
  }

  it('shows the initials of the first two words, uppercased', () => {
    const fixture = render('Maria Popescu');
    expect((fixture.nativeElement as HTMLElement).textContent?.trim()).toBe('MP');
  });

  it('keeps a single initial for a one-word name', () => {
    const fixture = render('Maria');
    expect((fixture.nativeElement as HTMLElement).textContent?.trim()).toBe('M');
  });

  it('preserves Romanian diacritics in initials', () => {
    const fixture = render('Ștefan Ionuț');
    expect((fixture.nativeElement as HTMLElement).textContent?.trim()).toBe('ȘI');
  });

  it('is decorative (aria-hidden) without a label', () => {
    const fixture = render('Maria');
    const host = fixture.nativeElement as HTMLElement;

    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(host.getAttribute('role')).toBeNull();
  });

  it('becomes an accessible image when a label is given', () => {
    const fixture = render('Maria');
    fixture.componentRef.setInput('label', 'Maria');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('role')).toBe('img');
    expect(host.getAttribute('aria-label')).toBe('Maria');
    expect(host.getAttribute('aria-hidden')).toBeNull();
  });

  it('picks the same tone for the same name every time', () => {
    const first = render('Maria');
    const second = render('Maria');

    expect(first.nativeElement.getAttribute('data-tone')).toBe(
      second.nativeElement.getAttribute('data-tone'),
    );
  });

  it('sizes the circle from the size input', () => {
    const fixture = render('Maria');
    fixture.componentRef.setInput('size', 56);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).style.getPropertyValue('--avatar-size')).toBe(
      '56px',
    );
  });
});
