import { buildHistoryListItems } from '../historyListItems';
import type { Message } from '../../../entities/message';

const msg = (id: string, createdAt: string): Message => ({
  id,
  chatId: 'c1',
  type: 'simple',
  body: id,
  scheduledAt: null,
  intervalMinutes: null,
  enabled: true,
  payload: null,
  createdAt,
  updatedAt: createdAt,
});

describe('buildHistoryListItems', () => {
  it('should put the latest message first so inverted FlatList shows it at the visual bottom', () => {
    const items = buildHistoryListItems([
      msg('old', '2026-01-01T10:00:00.000Z'),
      msg('mid', '2026-01-01T11:00:00.000Z'),
      msg('new', '2026-01-02T09:00:00.000Z'),
    ]);

    const keys = items.map((item) => item.key);
    expect(keys[0]).toBe('new');
    expect(keys[keys.length - 1]).toBe('date-2026-01-01');
  });

  it('should keep date separators above that day’s messages in visual top-to-bottom order', () => {
    const items = buildHistoryListItems([
      msg('a', '2026-01-01T10:00:00.000Z'),
      msg('b', '2026-01-02T10:00:00.000Z'),
    ]);
    // inverted: index 0 at visual bottom. Reading top→bottom = reverse(keys).
    const visualTopToBottom = [...items].reverse().map((item) => item.key);
    expect(visualTopToBottom).toEqual(['date-2026-01-01', 'a', 'date-2026-01-02', 'b']);
  });
});
