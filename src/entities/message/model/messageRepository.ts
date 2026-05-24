import { getDatabase } from '../../../shared/db';
import type { Message, MessageType } from './types';

const SELECT_COLUMNS =
  'id, chat_id, type, body, scheduled_at, interval_minutes, enabled, payload, created_at, updated_at';

export function createMessage(
  chatId: string,
  type: MessageType,
  body: string,
  scheduledAt?: string | null,
  intervalMinutes?: number | null,
  payload?: string | null,
): Message {
  const db = getDatabase();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const sAt = scheduledAt ?? null;
  const interval = intervalMinutes ?? null;
  const enabled = type === 'simple' ? 0 : 1;
  const pl = payload ?? null;

  db.executeSync(
    `INSERT INTO messages (id, chat_id, type, body, scheduled_at, interval_minutes, enabled, payload, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, chatId, type, body, sAt, interval, enabled, pl, now, now],
  );

  return {
    id,
    chatId,
    type,
    body,
    scheduledAt: sAt,
    intervalMinutes: interval,
    enabled: enabled === 1,
    payload: pl,
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

  const body = fields.body ?? existing.body;
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

  db.executeSync(
    `UPDATE messages SET body = ?, scheduled_at = ?, interval_minutes = ?, enabled = ?, payload = ?, updated_at = ? WHERE id = ?`,
    [body, scheduledAt, intervalMinutes, enabled, payload, now, id],
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
    createdAt: existing.createdAt,
    updatedAt: now,
  };
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

export function getScheduledMessages(): Message[] {
  const db = getDatabase();
  const now = new Date().toISOString();
  const result = db.executeSync(
    `SELECT ${SELECT_COLUMNS} FROM messages
     WHERE enabled = 1
       AND (scheduled_at > ? OR type = 'periodic')`,
    [now],
  );

  return result.rows.map(mapRow);
}

export function getMessagesForChatAtTime(chatId: string): Message[] {
  const db = getDatabase();
  const now = new Date().toISOString();
  const result = db.executeSync(
    `SELECT ${SELECT_COLUMNS} FROM messages
     WHERE chat_id = ?
       AND type IN ('reminder', 'alarm')
       AND scheduled_at <= ?`,
    [chatId, now],
  );

  return result.rows.map(mapRow);
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
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
