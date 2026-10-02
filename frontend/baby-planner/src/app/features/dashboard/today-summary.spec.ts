import { Activity } from '../../core/models/activity';
import { groupByPartOfDay, newestFirst, ongoingSleep, summarizeToday } from './today-summary';

const at = (hour: number, minute = 0) => new Date(2026, 8, 25, hour, minute).toISOString();

function activity(id: number, type: Activity['type'], occurredAt: string): Activity {
  return { id, babyId: 1, type, occurredAt, notes: null };
}

describe('today-summary', () => {
  describe('summarizeToday', () => {
    it('always returns the three core types, even for an empty day', () => {
      const tiles = summarizeToday([]);

      expect(tiles.map((tile) => tile.type)).toEqual(['Feeding', 'Sleep', 'Diaper']);
      expect(tiles.every((tile) => tile.count === 0 && tile.last === undefined)).toBe(true);
    });

    it('adds any other type present today, in the canonical order', () => {
      const tiles = summarizeToday([activity(1, 'Other', at(9)), activity(2, 'Medicine', at(8))]);

      expect(tiles.map((tile) => tile.type)).toEqual([
        'Feeding',
        'Sleep',
        'Diaper',
        'Medicine',
        'Other',
      ]);
    });

    it('counts per type and picks the most recent one as last', () => {
      const tiles = summarizeToday([
        activity(1, 'Feeding', at(3)),
        activity(2, 'Feeding', at(15, 30)),
        activity(3, 'Feeding', at(9)),
        activity(4, 'Sleep', at(13)),
      ]);

      const feeding = tiles.find((tile) => tile.type === 'Feeding')!;
      expect(feeding.count).toBe(3);
      expect(feeding.last?.id).toBe(2);
      expect(tiles.find((tile) => tile.type === 'Sleep')?.count).toBe(1);
    });

    it('totals ml and minutes only from the structured fields', () => {
      const tiles = summarizeToday([
        { ...activity(1, 'Feeding', at(3)), amountMl: 120 },
        { ...activity(2, 'Feeding', at(7)), amountMl: 90, durationMinutes: 10 },
        // Notitele nu se citesc niciodata ca numere.
        { ...activity(3, 'Feeding', at(9)), notes: '200 ml' },
        { ...activity(4, 'Sleep', at(1)), durationMinutes: 300 },
        { ...activity(5, 'Sleep', at(13)), durationMinutes: 80 },
        { ...activity(6, 'Sleep', at(15)), inProgress: true },
      ]);

      const feeding = tiles.find((tile) => tile.type === 'Feeding')!;
      expect(feeding.totalMl).toBe(210);
      expect(feeding.totalMinutes).toBe(10);
      expect(tiles.find((tile) => tile.type === 'Sleep')!.totalMinutes).toBe(380);
    });

    it('has no totals when nothing was measured (no fake "0 ml")', () => {
      const tiles = summarizeToday([activity(1, 'Feeding', at(3))]);

      expect(tiles[0].totalMl).toBeUndefined();
      expect(tiles[0].totalMinutes).toBeUndefined();
    });
  });

  describe('ongoingSleep', () => {
    it('finds the most recent sleep still in progress, ignoring old sleeps without a duration', () => {
      const list = [
        activity(1, 'Sleep', at(2)),
        { ...activity(2, 'Sleep', at(10)), inProgress: true },
        { ...activity(3, 'Sleep', at(14)), inProgress: true },
      ];

      expect(ongoingSleep(list)?.id).toBe(3);
      expect(ongoingSleep([activity(1, 'Sleep', at(2))])).toBeUndefined();
    });
  });

  describe('newestFirst', () => {
    it('compares instants, not strings, and breaks ties by id', () => {
      const sorted = newestFirst([
        activity(1, 'Feeding', '2026-09-25T10:00:00+00:00'),
        activity(2, 'Feeding', '2026-09-25T10:00:00.5+00:00'),
        activity(3, 'Feeding', '2026-09-25T10:00:00+00:00'),
      ]);

      expect(sorted.map((item) => item.id)).toEqual([2, 3, 1]);
    });
  });

  describe('groupByPartOfDay', () => {
    it('groups a newest-first list into evening, afternoon, morning and night', () => {
      const groups = groupByPartOfDay(
        newestFirst([
          activity(1, 'Feeding', at(3)),
          activity(2, 'Diaper', at(7)),
          activity(3, 'Feeding', at(9)),
          activity(4, 'Sleep', at(13)),
          activity(5, 'Feeding', at(19)),
        ]),
      );

      expect(groups.map((group) => group.label)).toEqual([
        'Seara',
        'După-amiaza',
        'Dimineața',
        'Noaptea',
      ]);
      expect(groups[2].activities.map((item) => item.id)).toEqual([3, 2]);
    });

    it('returns no groups for an empty list', () => {
      expect(groupByPartOfDay([])).toEqual([]);
    });
  });
});
