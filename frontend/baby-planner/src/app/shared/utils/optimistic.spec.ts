import { Activity } from '../../core/models/activity';
import { insertActivity, removeActivity, replaceActivity } from './optimistic';

function activity(id: number, occurredAt: string, notes: string | null = null): Activity {
  return { id, babyId: 1, type: 'Feeding', occurredAt, notes };
}

describe('insertActivity', () => {
  it('inserts into an empty list', () => {
    const result = insertActivity([], activity(1, '2026-09-25T10:00:00Z'));
    expect(result).toEqual([activity(1, '2026-09-25T10:00:00Z')]);
  });

  it('keeps the list ordered newest-first', () => {
    const list = [activity(1, '2026-09-25T10:00:00Z'), activity(2, '2026-09-24T10:00:00Z')];
    const result = insertActivity(list, activity(3, '2026-09-25T09:00:00Z'));
    expect(result.map((item) => item.id)).toEqual([1, 3, 2]);
  });

  it('inserts at the front when it is the newest', () => {
    const list = [activity(1, '2026-09-24T10:00:00Z')];
    const result = insertActivity(list, activity(2, '2026-09-25T10:00:00Z'));
    expect(result.map((item) => item.id)).toEqual([2, 1]);
  });

  it('inserts at the back when it is the oldest', () => {
    const list = [activity(1, '2026-09-25T10:00:00Z')];
    const result = insertActivity(list, activity(2, '2026-09-24T10:00:00Z'));
    expect(result.map((item) => item.id)).toEqual([1, 2]);
  });

  it('does not mutate the original list', () => {
    const list = [activity(1, '2026-09-24T10:00:00Z')];
    insertActivity(list, activity(2, '2026-09-25T10:00:00Z'));
    expect(list.map((item) => item.id)).toEqual([1]);
  });
});

describe('replaceActivity', () => {
  it('replaces the activity with the matching id', () => {
    const list = [activity(1, '2026-09-25T10:00:00Z'), activity(2, '2026-09-24T10:00:00Z')];
    const updated = activity(2, '2026-09-24T12:00:00Z', 'schimbat');

    const result = replaceActivity(list, updated);

    expect(result[1]).toEqual(updated);
    expect(result).not.toBe(list);
  });

  it('leaves the list contents unchanged when the id is not found', () => {
    const list = [activity(1, '2026-09-25T10:00:00Z')];

    const result = replaceActivity(list, activity(99, '2026-09-25T10:00:00Z'));

    expect(result).toEqual(list);
    expect(result).not.toBe(list);
  });
});

describe('removeActivity', () => {
  it('removes the activity with the given id', () => {
    const list = [activity(1, '2026-09-25T10:00:00Z'), activity(2, '2026-09-24T10:00:00Z')];

    const result = removeActivity(list, 1);

    expect(result.map((item) => item.id)).toEqual([2]);
  });

  it('returns a new array even when nothing matches', () => {
    const list = [activity(1, '2026-09-25T10:00:00Z')];

    const result = removeActivity(list, 999);

    expect(result).toEqual(list);
    expect(result).not.toBe(list);
  });
});
