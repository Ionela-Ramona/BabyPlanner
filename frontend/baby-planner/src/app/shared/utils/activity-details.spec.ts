import { Activity } from '../../core/models/activity';
import { detailsLabel, durationLabel } from './activity-details';

const base: Activity = { id: 1, babyId: 1, type: 'Feeding', occurredAt: '2026-09-25T10:00:00Z', notes: null };

describe('durationLabel', () => {
  it.each([
    [5, '5 min'],
    [60, '1 h'],
    [90, '1 h 30 min'],
    [580, '9 h 40 min'],
  ])('%i minutes -> %s', (minutes, label) => {
    expect(durationLabel(minutes)).toBe(label);
  });
});

describe('detailsLabel', () => {
  it('is empty for an activity without details (old rows, quick logs)', () => {
    expect(detailsLabel(base)).toBe('');
  });

  it('joins amount and duration for a feed', () => {
    expect(detailsLabel({ ...base, amountMl: 120, durationMinutes: 15 })).toBe('120 ml · 15 min');
  });

  it('names the diaper kind in Romanian', () => {
    expect(detailsLabel({ ...base, type: 'Diaper', diaperKind: 'Both' })).toBe('Ud și murdar');
  });

  it('says the baby is still asleep', () => {
    expect(detailsLabel({ ...base, type: 'Sleep', inProgress: true })).toBe('doarme încă');
  });

  it('never reads numbers out of the notes', () => {
    expect(detailsLabel({ ...base, notes: '120 ml lapte praf' })).toBe('');
  });
});
