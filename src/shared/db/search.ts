import { getDatabase } from './db';

export interface SearchResult {
  id: string;
  chat_id: string;
  type: string;
  body: string;
  highlighted: string;
  created_at: string;
  updated_at: string;
}

export function searchMessages(
  query: string,
  chatId?: string,
): SearchResult[] {
  const db = getDatabase();

  const ftsQuery = query
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => `"${w}"*`)
    .join(' ');

  if (!ftsQuery) return [];

  const where = chatId ? 'AND m.chat_id = ?' : '';
  const params: unknown[] = [ftsQuery];
  if (chatId) params.push(chatId);

  const sql = `
    SELECT
      m.id,
      m.chat_id,
      m.type,
      m.body,
      highlight(messages_fts, 0, '<mark>', '</mark>') AS highlighted,
      m.created_at,
      m.updated_at
    FROM messages_fts
    JOIN messages m ON m.rowid = messages_fts.rowid
    WHERE messages_fts MATCH ? ${where}
    ORDER BY rank
  `;

  const result = db.executeSync(sql, params);
  return result.rows as unknown as SearchResult[];
}
