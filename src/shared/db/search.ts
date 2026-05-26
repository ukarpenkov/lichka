import { getDatabase } from './db';

type RawRow = Record<string, unknown>;

export interface SearchResult {
  id: string;
  chat_id: string;
  chat_title: string;
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
  try {
    return searchMessagesFts(query, chatId);
  } catch {
    return searchMessagesLike(query, chatId);
  }
}

function searchMessagesFts(
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
  const params: (string | null)[] = [ftsQuery];
  if (chatId) params.push(chatId);

  const sql = `
    SELECT
      m.id,
      m.chat_id,
      c.title AS chat_title,
      m.type,
      m.body,
      highlight(messages_fts, 0, '<mark>', '</mark>') AS highlighted,
      m.created_at,
      m.updated_at
    FROM messages_fts
    JOIN messages m ON m.rowid = messages_fts.rowid
    JOIN chats c ON c.id = m.chat_id
    WHERE messages_fts MATCH ? ${where}
    ORDER BY rank
  `;

  const result = db.executeSync(sql, params);
  return result.rows as unknown as SearchResult[];
}

function searchMessagesLike(
  query: string,
  chatId?: string,
): SearchResult[] {
  const db = getDatabase();
  const trimmed = query.trim();
  if (!trimmed) return [];

  const likeQuery = `%${trimmed}%`;
  const chatFilter = chatId ? 'AND m.chat_id = ?' : '';
  const params: (string | null)[] = [likeQuery];
  if (chatId) params.push(chatId);

  const sql = `
    SELECT
      m.id,
      m.chat_id,
      c.title AS chat_title,
      m.type,
      m.body,
      m.created_at,
      m.updated_at
    FROM messages m
    JOIN chats c ON c.id = m.chat_id
    WHERE m.body LIKE ? ${chatFilter}
    ORDER BY m.created_at DESC
    LIMIT 50
  `;

  const result = db.executeSync(sql, params);
  return (result.rows as unknown as RawRow[]).map((row) => ({
    ...row,
    highlighted: highlightText(row.body as string, trimmed),
  })) as SearchResult[];
}

function highlightText(text: string, query: string): string {
  const words = query
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  if (words.length === 0) return text;

  const pattern = new RegExp(`(${words.join('|')})`, 'gi');
  return text.replace(pattern, '<mark>$1</mark>');
}
