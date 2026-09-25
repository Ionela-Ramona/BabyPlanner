import {
  ACTIVITY_NOUN,
  ageLabel,
  countLabel,
  dayHeader,
  fromLocalInputValue,
  isSameLocalDay,
  parseDateOnly,
  partOfDay,
  relativeLabel,
  timeLabel,
  toLocalInputValue,
} from './ro-time';

describe('parseDateOnly', () => {
  it('builds a local calendar date, not a UTC one', () => {
    const date = parseDateOnly('2026-03-24');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(2);
    expect(date.getDate()).toBe(24);
    expect(date.getHours()).toBe(0);
  });
});

describe('isSameLocalDay', () => {
  it('ignores the time of day', () => {
    expect(isSameLocalDay(new Date(2026, 8, 25, 0, 1), new Date(2026, 8, 25, 23, 59))).toBe(true);
  });

  it('is false across a day boundary', () => {
    expect(isSameLocalDay(new Date(2026, 8, 25, 23, 59), new Date(2026, 8, 26, 0, 1))).toBe(false);
  });
});

describe('countLabel', () => {
  it('uses the singular form for 1', () => {
    expect(countLabel(1, 'masă')).toBe('1 masă');
  });

  it('uses the plural form without "de" for small counts', () => {
    expect(countLabel(2, 'masă')).toBe('2 mese');
    expect(countLabel(19, 'masă')).toBe('19 mese');
  });

  it('uses "few" for 0, following Intl.PluralRules', () => {
    expect(countLabel(0, 'masă')).toBe('0 mese');
  });

  it('adds "de" from 20 upward', () => {
    expect(countLabel(20, 'masă')).toBe('20 de mese');
    expect(countLabel(21, 'masă')).toBe('21 de mese');
  });

  it('follows Intl.PluralRules for numbers ending in 01 and 20', () => {
    // Intl.PluralRules('ro').select(101) === 'few', select(120) === 'other'.
    expect(countLabel(101, 'masă')).toBe('101 mese');
    expect(countLabel(120, 'masă')).toBe('120 de mese');
  });

  it('works for every noun used by activity types', () => {
    expect(countLabel(3, 'somn')).toBe('3 somnuri');
    expect(countLabel(3, 'scutec')).toBe('3 scutece');
    expect(countLabel(3, 'medicament')).toBe('3 medicamente');
    expect(countLabel(3, 'activitate')).toBe('3 activități');
    expect(countLabel(45, 'minut')).toBe('45 de minute');
    expect(countLabel(2, 'oră')).toBe('2 ore');
  });
});

describe('ACTIVITY_NOUN', () => {
  it('maps every activity type to its noun', () => {
    expect(ACTIVITY_NOUN.Feeding).toBe('masă');
    expect(ACTIVITY_NOUN.Sleep).toBe('somn');
    expect(ACTIVITY_NOUN.Diaper).toBe('scutec');
    expect(ACTIVITY_NOUN.Medicine).toBe('medicament');
    expect(ACTIVITY_NOUN.Other).toBe('activitate');
  });
});

describe('ageLabel', () => {
  it('returns "prima zi" for a baby born today', () => {
    const today = new Date(2026, 8, 25);
    expect(ageLabel('2026-09-25', today)).toBe('prima zi');
  });

  it('counts single days below two weeks', () => {
    expect(ageLabel('2026-09-24', new Date(2026, 8, 25))).toBe('1 zi');
    expect(ageLabel('2026-09-22', new Date(2026, 8, 25))).toBe('3 zile');
    expect(ageLabel('2026-09-12', new Date(2026, 8, 25))).toBe('13 zile');
  });

  it('switches to weeks between 14 days and two months', () => {
    // 2026-09-11 -> 2026-09-25 = 14 days = exactly 2 weeks.
    expect(ageLabel('2026-09-11', new Date(2026, 8, 25))).toBe('2 săptămâni');
    // 2026-08-01 -> 2026-09-25 = under 2 calendar months, several weeks in.
    expect(ageLabel('2026-08-01', new Date(2026, 8, 25))).toBe('7 săptămâni');
  });

  it('switches to months from two calendar months', () => {
    // 25 martie -> 25 septembrie = 6 luni calendaristice.
    expect(ageLabel('2026-03-25', new Date(2026, 8, 25))).toBe('6 luni');
    expect(ageLabel('2026-07-25', new Date(2026, 8, 25))).toBe('2 luni');
  });

  it('switches to years at 12 months, with remaining months spelled out', () => {
    expect(ageLabel('2025-09-25', new Date(2026, 8, 25))).toBe('1 an');
    expect(ageLabel('2025-07-25', new Date(2026, 8, 25))).toBe('1 an și 2 luni');
  });

  it('handles a birthday on 29 February against a non-leap year', () => {
    // 2024 e bisect; 2025 nu are 29 februarie, deci se plafoneaza la 28.
    const birth = '2024-02-29';
    // La 28 februarie 2025 luna e considerata incheiata (12 luni = 1 an).
    expect(ageLabel(birth, new Date(2025, 1, 28))).toBe('1 an');
  });

  it('handles a birthday on the 31st against a shorter month', () => {
    // 31 ianuarie -> 28 februarie (an nebisect): luna se considera incheiata.
    expect(ageLabel('2026-01-31', new Date(2026, 1, 28))).toBe('4 săptămâni');
  });
});

describe('relativeLabel', () => {
  const now = new Date(2026, 8, 25, 16, 0, 0);

  it('says "acum" for anything under a minute', () => {
    expect(relativeLabel(new Date(2026, 8, 25, 15, 59, 30), now)).toBe('acum');
    expect(relativeLabel(now, now)).toBe('acum');
  });

  it('formats minutes', () => {
    expect(relativeLabel(new Date(2026, 8, 25, 15, 55, 0), now)).toBe('acum 5 minute');
    expect(relativeLabel(new Date(2026, 8, 25, 15, 59, 0), now)).toBe('acum 1 minut');
  });

  it('formats hours', () => {
    expect(relativeLabel(new Date(2026, 8, 25, 14, 0, 0), now)).toBe('acum 2 ore');
    expect(relativeLabel(new Date(2026, 8, 25, 15, 0, 0), now)).toBe('acum 1 oră');
  });

  it('formats yesterday and older days', () => {
    expect(relativeLabel(new Date(2026, 8, 24, 16, 0, 0), now)).toBe('ieri');
    expect(relativeLabel(new Date(2026, 8, 22, 16, 0, 0), now)).toBe('acum 3 zile');
  });

  it('accepts an ISO string instant', () => {
    expect(relativeLabel(now.toISOString(), now)).toBe('acum');
  });
});

describe('timeLabel', () => {
  it('formats a 24h, zero-padded local time', () => {
    expect(timeLabel(new Date(2026, 8, 25, 16, 4))).toBe('16:04');
    expect(timeLabel(new Date(2026, 8, 25, 4, 4))).toBe('04:04');
  });
});

describe('partOfDay', () => {
  it('buckets each hour range', () => {
    expect(partOfDay(new Date(2026, 8, 25, 0, 0))).toBe('Noaptea');
    expect(partOfDay(new Date(2026, 8, 25, 5, 59))).toBe('Noaptea');
    expect(partOfDay(new Date(2026, 8, 25, 6, 0))).toBe('Dimineața');
    expect(partOfDay(new Date(2026, 8, 25, 11, 59))).toBe('Dimineața');
    expect(partOfDay(new Date(2026, 8, 25, 12, 0))).toBe('După-amiaza');
    expect(partOfDay(new Date(2026, 8, 25, 17, 59))).toBe('După-amiaza');
    expect(partOfDay(new Date(2026, 8, 25, 18, 0))).toBe('Seara');
    expect(partOfDay(new Date(2026, 8, 25, 23, 59))).toBe('Seara');
  });
});

describe('dayHeader', () => {
  const today = new Date(2026, 8, 25);

  it('returns "Azi" for today', () => {
    expect(dayHeader(new Date(2026, 8, 25, 9, 0), today)).toBe('Azi');
  });

  it('returns "Ieri" for yesterday', () => {
    expect(dayHeader(new Date(2026, 8, 24, 9, 0), today)).toBe('Ieri');
  });

  it('spells out older dates without the year when it matches today', () => {
    expect(dayHeader(new Date(2026, 8, 18, 9, 0), today)).toBe('vineri, 18 septembrie');
  });

  it('adds the year when it differs from today', () => {
    // 18 septembrie 2025 a fost joi, nu vineri ca in 2026.
    expect(dayHeader(new Date(2025, 8, 18, 9, 0), today)).toBe('joi, 18 septembrie 2025');
  });
});

describe('toLocalInputValue / fromLocalInputValue', () => {
  it('round-trips a local date into the datetime-local shape', () => {
    const date = new Date(2026, 8, 25, 16, 4);
    expect(toLocalInputValue(date)).toBe('2026-09-25T16:04');
  });

  it('pads single-digit month, day, hour and minute', () => {
    expect(toLocalInputValue(new Date(2026, 0, 5, 4, 9))).toBe('2026-01-05T04:09');
  });

  it('converts a datetime-local string to an ISO UTC instant', () => {
    const date = new Date(2026, 8, 25, 16, 4);
    expect(fromLocalInputValue('2026-09-25T16:04')).toBe(date.toISOString());
  });
});
