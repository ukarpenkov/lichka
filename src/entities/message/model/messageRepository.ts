import { getDatabase } from '../../../shared/db';
import { normalizeSearchText } from '../../../shared/db/normalizeSearchText';
import { generateId } from '../../../shared/lib';
import type { Message, MessageType, ChecklistItem } from './types';
import { checklistFromText, parseChecklist } from './checklist';

const SELECT_COLUMNS =
  'id, chat_id, type, body, scheduled_at, interval_minutes, enabled, payload, created_at, updated_at, checklist';

export function createMessage(
  chatId: string,
  type: MessageType,
  body: string,
  scheduledAt?: string | null,
  intervalMinutes?: number | null,
  payload?: string | null,
  id?: string,
  checklist?: ChecklistItem[] | null,
): Message {
  const db = getDatabase();
  const msgId = id ?? generateId();
  const sAt = scheduledAt ?? null;
  const now = sAt ?? new Date().toISOString();
  const interval = intervalMinutes ?? null;
  const enabled = type === 'simple' || type === 'image' ? 0 : 1;
  const pl = payload ?? null;
  const items = checklist?.length ? checklistFromText(body, checklist) : null;
  const textBody = items?.length ? items.map(item => item.text).join('\n') : body;
  const bodyLc = normalizeSearchText(textBody);

  db.executeSync(
    `INSERT INTO messages (id, chat_id, type, body, body_lc, scheduled_at, interval_minutes, enabled, payload, created_at, updated_at, checklist)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [msgId, chatId, type, textBody, bodyLc, sAt, interval, enabled, pl, now, now,
      items?.length ? JSON.stringify(items) : null],
  );

  return {
    id: msgId,
    chatId,
    type,
    body: textBody,
    scheduledAt: sAt,
    intervalMinutes: interval,
    enabled: enabled === 1,
    payload: pl,
    checklist: items?.length ? items : null,
    createdAt: now,
    updatedAt: now,
  };
}

export function getMessagesByChatId(chatId: string): Message[] {
  const db = getDatabase();
  const result = db.executeSync(
    `SELECT ${SELECT_COLUMNS} FROM messages WHERE chat_id = ? ORDER BY created_at ASC`,
    [chatId],
  );

  return result.rows.map(mapRow);
}

export function getMessageById(id: string): Message | null {
  const db = getDatabase();
  const result = db.executeSync(
    `SELECT ${SELECT_COLUMNS} FROM messages WHERE id = ?`,
    [id],
  );

  if (result.rows.length === 0) return null;
  return mapRow(result.rows[0]);
}

export function updateMessage(
  id: string,
  fields: {
    body?: string;
    scheduledAt?: string | null;
    intervalMinutes?: number | null;
    enabled?: boolean;
    payload?: string | null;
  },
): Message | null {
  const db = getDatabase();
  const existing = getMessageById(id);
  if (!existing) return null;

  let body = fields.body ?? existing.body;
  const scheduledAt =
    fields.scheduledAt !== undefined ? fields.scheduledAt : existing.scheduledAt;
  const intervalMinutes =
    fields.intervalMinutes !== undefined
      ? fields.intervalMinutes
      : existing.intervalMinutes;
  const enabled =
    fields.enabled !== undefined ? (fields.enabled ? 1 : 0) : existing.enabled ? 1 : 0;
  const payload =
    fields.payload !== undefined ? fields.payload : existing.payload;
  const now = new Date().toISOString();

  const items = existing.checklist
    ? checklistFromText(body, existing.checklist)
    : null;
  const checklist = items?.length ? items : null;
  if (checklist) body = checklist.map(item => item.text).join('\n');

  db.executeSync(
    `UPDATE messages SET body = ?, body_lc = ?, scheduled_at = ?, interval_minutes = ?, enabled = ?, payload = ?, updated_at = ?, checklist = ? WHERE id = ?`,
    [
      body,
      normalizeSearchText(body),
      scheduledAt,
      intervalMinutes,
      enabled,
      payload,
      now,
      checklist ? JSON.stringify(checklist) : null,
      id,
    ],
  );

  return {
    id,
    chatId: existing.chatId,
    type: existing.type,
    body,
    scheduledAt,
    intervalMinutes,
    enabled: enabled === 1,
    payload,
    checklist,
    createdAt: existing.createdAt,
    updatedAt: now,
  };
}

/** Read the latest persisted state so rapid taps never overwrite another item. */
export function toggleMessageChecklistItem(id: string, itemId: string): Message | null {
  const existing = getMessageById(id);
  if (!existing?.checklist?.some(item => item.id === itemId)) return null;
  const checklist = existing.checklist.map(item => item.id === itemId
    ? { ...item, checked: !item.checked }
    : item);
  const updatedAt = new Date().toISOString();
  getDatabase().executeSync(
    'UPDATE messages SET checklist = ?, updated_at = ? WHERE id = ?',
    [JSON.stringify(checklist), updatedAt, id],
  );
  return { ...existing, checklist, updatedAt };
}

export function deleteMessage(id: string): boolean {
  const db = getDatabase();
  const message = getMessageById(id);
  if (!message) return false;

  db.executeSync('DELETE FROM messages WHERE id = ?', [id]);

  if (message.payload) {
    try {
      const RNFS = require('react-native-fs');
      const parsed = JSON.parse(message.payload);
      if (parsed.uri) {
        RNFS.unlink(parsed.uri).catch(() => {});
      }
    } catch {
      // payload is not JSON or react-native-fs not available
    }
  }

  return true;
}

export function disableFiredMessages(): number {
  const db = getDatabase();
  const now = new Date().toISOString();
  const result = db.executeSync(
    `UPDATE messages SET enabled = 0
     WHERE enabled = 1
       AND type IN ('reminder', 'alarm')
       AND scheduled_at IS NOT NULL
       AND scheduled_at <= ?`,
    [now],
  );
  return result.rowsAffected;
}

export function getScheduledMessages(): Message[] {
  const db = getDatabase();
  const now = new Date().toISOString();
  const result = db.executeSync(
    `SELECT ${SELECT_COLUMNS} FROM messages
     WHERE enabled = 1
       AND type IN ('reminder', 'alarm', 'periodic')
       AND (scheduled_at > ? OR type = 'periodic')
     ORDER BY scheduled_at ASC`,
    [now],
  );

  return result.rows.map(mapRow);
}

export function getScheduledMessagesByChatId(chatId: string): Message[] {
  const db = getDatabase();
  const now = new Date().toISOString();
  const result = db.executeSync(
    `SELECT ${SELECT_COLUMNS} FROM messages
     WHERE chat_id = ?
       AND enabled = 1
       AND type IN ('reminder', 'alarm', 'periodic')
       AND (scheduled_at > ? OR type = 'periodic')
     ORDER BY scheduled_at ASC`,
    [chatId, now],
  );

  return result.rows.map(mapRow);
}

export function getVisibleMessagesByChatId(chatId: string): Message[] {
  const db = getDatabase();
  const result = db.executeSync(
    `SELECT ${SELECT_COLUMNS} FROM messages
     WHERE chat_id = ?
       AND type != 'periodic'
       AND (
         scheduled_at IS NULL
         OR REPLACE(SUBSTR(scheduled_at, 1, 19), 'T', ' ') <= datetime('now')
       )
     ORDER BY created_at ASC`,
    [chatId],
  );

  return result.rows.map(mapRow);
}

export const PERIODIC_DISPLAY_PREFIX = 'periodic:';

export function isPeriodicDisplayId(id: string): boolean {
  return id.startsWith(PERIODIC_DISPLAY_PREFIX);
}

export function extractTemplateId(displayId: string): string {
  return displayId.slice(PERIODIC_DISPLAY_PREFIX.length);
}

function getLatestPeriodicFireAt(template: Message, now: number): string | null {
  const interval = template.intervalMinutes;
  if (!interval || interval <= 0 || !Number.isFinite(interval)) return null;
  const createdAtMs = new Date(template.createdAt).getTime();
  const intervalMs = interval * 60_000;
  const fires = Math.floor((now - createdAtMs) / intervalMs);
  if (!Number.isFinite(fires) || fires <= 0) return null;
  return new Date(createdAtMs + fires * intervalMs).toISOString();
}

/** Keep the latest occurrence as a fired reminder, preserving identity and media. */
export function finishPeriodicMessage(id: string): Message | null {
  const template = getMessageById(id);
  if (!template || template.type !== 'periodic' || !template.enabled) return null;
  const latestFireAt = getLatestPeriodicFireAt(template, Date.now());
  if (!latestFireAt) return null;

  getDatabase().executeSync(
    `UPDATE messages SET type = 'reminder', enabled = 0, interval_minutes = NULL,
     scheduled_at = ?, created_at = ?, updated_at = ? WHERE id = ?`,
    [latestFireAt, latestFireAt, latestFireAt, id],
  );
  return {
    ...template,
    type: 'reminder',
    enabled: false,
    intervalMinutes: null,
    scheduledAt: latestFireAt,
    createdAt: latestFireAt,
    updatedAt: latestFireAt,
  };
}

export function getPeriodicDisplayMessages(chatId: string): Message[] {
  const db = getDatabase();
  const result = db.executeSync(
    `SELECT ${SELECT_COLUMNS} FROM messages
     WHERE chat_id = ?
       AND type = 'periodic'
       AND enabled = 1`,
    [chatId],
  );

  const now = Date.now();
  const displayMessages: Message[] = [];

  for (const row of result.rows) {
    const template = mapRow(row);
    const latestFireAt = getLatestPeriodicFireAt(template, now);
    if (latestFireAt) {
      displayMessages.push({
        ...template,
        id: PERIODIC_DISPLAY_PREFIX + template.id,
        createdAt: latestFireAt,
        updatedAt: latestFireAt,
      });
    }
  }

  return displayMessages;
}

export function getMessagesForChatAtTime(chatId: string): Message[] {
  const db = getDatabase();
  const result = db.executeSync(
    `SELECT ${SELECT_COLUMNS} FROM messages
     WHERE chat_id = ?
       AND type IN ('reminder', 'alarm')
       AND REPLACE(SUBSTR(scheduled_at, 1, 19), 'T', ' ') <= datetime('now')`,
    [chatId],
  );

  return result.rows.map(mapRow);
}

/**
 * Unread = fired app notifications only (reminder / alarm / periodic),
 * not user-authored simple/image messages.
 */
export function getUnreadCounts(): Record<string, number> {
  const db = getDatabase();
  const counts: Record<string, number> = {};

  const firedResult = db.executeSync(
    `SELECT m.chat_id, COUNT(*) AS cnt
     FROM messages m
     LEFT JOIN chat_read_markers r ON r.chat_id = m.chat_id
     WHERE m.type IN ('reminder', 'alarm')
       AND m.scheduled_at IS NOT NULL
       AND REPLACE(SUBSTR(m.scheduled_at, 1, 19), 'T', ' ') <= datetime('now')
       AND (r.last_read_at IS NULL OR r.last_read_at < m.created_at)
     GROUP BY m.chat_id`,
  );

  for (const row of firedResult.rows) {
    counts[row.chat_id as string] = row.cnt as number;
  }

  const periodicResult = db.executeSync(
    `SELECT m.chat_id, m.created_at, m.interval_minutes, r.last_read_at
     FROM messages m
     LEFT JOIN chat_read_markers r ON r.chat_id = m.chat_id
     WHERE m.type = 'periodic'
       AND m.enabled = 1
       AND m.interval_minutes IS NOT NULL`,
  );

  const now = Date.now();
  for (const row of periodicResult.rows) {
    const intervalMinutes = row.interval_minutes as number;
    const createdAtMs = new Date(row.created_at as string).getTime();
    const intervalMs = intervalMinutes * 60_000;
    const fires = Math.floor((now - createdAtMs) / intervalMs);
    if (fires <= 0) continue;

    const latestFireAt = new Date(createdAtMs + fires * intervalMs).toISOString();
    const lastReadAt = row.last_read_at as string | null;
    if (lastReadAt !== null && lastReadAt >= latestFireAt) continue;

    const chatId = row.chat_id as string;
    counts[chatId] = (counts[chatId] ?? 0) + 1;
  }

  return counts;
}

export function markChatAsRead(chatId: string): void {
  const db = getDatabase();
  const now = new Date().toISOString();
  db.executeSync(
    'INSERT OR REPLACE INTO chat_read_markers (chat_id, last_read_at) VALUES (?, ?)',
    [chatId, now],
  );
}

/** All read markers for backup export. */
export function getAllReadMarkers(): Record<string, string> {
  const db = getDatabase();
  const result = db.executeSync(
    'SELECT chat_id, last_read_at FROM chat_read_markers',
  );
  const markers: Record<string, string> = {};
  for (const row of result.rows) {
    markers[row.chat_id as string] = row.last_read_at as string;
  }
  return markers;
}

function mapRow(row: Record<string, unknown>): Message {
  return {
    id: row.id as string,
    chatId: row.chat_id as string,
    type: row.type as MessageType,
    body: row.body as string,
    scheduledAt: row.scheduled_at as string | null,
    intervalMinutes: row.interval_minutes as number | null,
    enabled: (row.enabled as number) === 1,
    payload: row.payload as string | null,
    checklist: parseChecklist(row.checklist),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
