import { buildSearchListItems } from '../SearchOverlay';
import type { SearchResult } from '../../../entities/message';

function makeResult(
  id: string,
  created_at: string,
  body = 'привет',
): SearchResult {
  return {
    id,
    chat_id: 'chat-1',
    chat_title: 'Chat',
    type: 'text',
    body,
    highlighted: body,
    created_at,
    updated_at: created_at,
  };
}

describe('buildSearchListItems', () => {
  it('returns empty list when there are no matches', () => {
    expect(buildSearchListItems([])).toEqual([]);
  });

  it('inserts a date label before each day group', () => {
    const items = buildSearchListItems([
      makeResult('a', '2026-07-10T12:00:00.000Z'),
      makeResult('b', '2026-07-09T08:00:00.000Z'),
    ]);

    expect(items.map((i) => i.kind)).toEqual(['date', 'result', 'date', 'result']);
    expect(items[0]).toMatchObject({ kind: 'date', date: '2026-07-10T12:00:00.000Z' });
    expect(items[1]).toMatchObject({ kind: 'result', result: { id: 'a' } });
    expect(items[2]).toMatchObject({ kind: 'date', date: '2026-07-09T08:00:00.000Z' });
    expect(items[3]).toMatchObject({ kind: 'result', result: { id: 'b' } });
  });

  it('uses one date label for multiple matches on the same day', () => {
    const items = buildSearchListItems([
      makeResult('a', '2026-07-09T18:00:00.000Z'),
      makeResult('b', '2026-07-09T08:00:00.000Z'),
    ]);

    expect(items.filter((i) => i.kind === 'date')).toHaveLength(1);
    expect(items.filter((i) => i.kind === 'result')).toHaveLength(2);
  });

  it('sorts matches by created_at descending before grouping', () => {
    const items = buildSearchListItems([
      makeResult('older', '2026-07-09T08:00:00.000Z'),
      makeResult('newer', '2026-07-10T12:00:00.000Z'),
    ]);

    const results = items.filter((i) => i.kind === 'result');
    expect(results[0]).toMatchObject({ result: { id: 'newer' } });
    expect(results[1]).toMatchObject({ result: { id: 'older' } });
  });
});
