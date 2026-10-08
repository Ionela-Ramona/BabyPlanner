import { birthDateLabel, initialsOf, toIsoDate } from './baby-format';

describe('baby-format', () => {
  it('formats a birth date in Romanian, as a calendar date', () => {
    expect(birthDateLabel('2026-03-25')).toBe('25 martie 2026');
    expect(birthDateLabel('2026-01-01')).toBe('1 ianuarie 2026');
  });

  it('takes the initials of the first two words', () => {
    expect(initialsOf('maria')).toBe('M');
    expect(initialsOf('  Ana   Maria  Popescu ')).toBe('AM');
    expect(initialsOf('')).toBe('');
  });

  it('writes a local date as YYYY-MM-DD, with padding', () => {
    expect(toIsoDate(new Date(2026, 2, 5))).toBe('2026-03-05');
    expect(toIsoDate(new Date(2026, 11, 31, 23, 59))).toBe('2026-12-31');
  });
});
