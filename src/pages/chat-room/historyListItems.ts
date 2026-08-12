import type { Message } from '../../entities/message';

export type HistoryListItem =
  | { kind: 'date'; key: string; date: string }
  | { kind: 'message'; key: string; message: Message };

function getDayKey(iso: string): string {
  return iso.slice(0, 10);
}

/**
 * Chronological rows (date separators + messages), then reversed so an
 * inverted FlatList can put the latest message at offset 0 — the visual
 * bottom, above the composer. Remount / keyboard / Future round-trip all
 * start at 0, so the tail stays pinned without scrollToEnd.
 */
export function buildHistoryListItems(messages: Message[]): HistoryListItem[] {
  const items: HistoryListItem[] = [];
  let prevDay = '';

  for (const msg of messages) {
    const day = getDayKey(msg.createdAt);
    if (day !== prevDay) {
      items.push({ kind: 'date', key: `date-${day}`, date: msg.createdAt });
      prevDay = day;
    }
    items.push({ kind: 'message', key: msg.id, message: msg });
  }

  items.reverse();
  return items;
}
