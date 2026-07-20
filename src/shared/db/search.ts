import { getDatabase } from './db';
import {
  escapeLikePattern,
  normalizeSearchText,
} from './normalizeSearchText';

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

/** Same visibility rules as the chat timeline (excludes future + periodic templates). */
const VISIBLE_MESSAGE_FILTER = `
  AND m.type != 'periodic'
  AND (
    m.scheduled_at IS NULL
    OR REPLACE(SUBSTR(m.scheduled_at, 1, 19), 'T', ' ') <= datetime('now')
  )
`;

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
    .map((w) => `"${w.replace(/"/g, '""')}"*`)
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
      ${VISIBLE_MESSAGE_FILTER}
    ORDER BY rank
    LIMIT 50
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

  const needle = normalizeSearchText(trimmed);
  const likeQuery = `%${escapeLikePattern(needle)}%`;
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
    WHERE COALESCE(m.body_lc, m.body) LIKE ? ESCAPE '\\'
      ${chatFilter}
      ${VISIBLE_MESSAGE_FILTER}
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
