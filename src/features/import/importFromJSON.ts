import { getDatabase } from '../../shared/db';
import { normalizeSearchText } from '../../shared/db/normalizeSearchText';
import { getChatById } from '../../entities/chat';
import { getMessageById } from '../../entities/message';
import {
  updateSettings,
  type AppSettings,
  getSettings,
} from '../../entities/settings';
import { getDictionary } from '../../shared/config/locale';
import {
  MIN_SUPPORTED_EXPORT_SCHEMA,
  MAX_SUPPORTED_EXPORT_SCHEMA,
} from '../export/buildExportData';

export type ImportMode = 'merge' | 'replace';

export interface ImportResult {
  chatsAdded: number;
  chatsUpdated: number;
  messagesAdded: number;
  messagesUpdated: number;
  settingsImported: boolean;
}

const ALLOWED_MESSAGE_TYPES = new Set([
  'simple',
  'reminder',
  'alarm',
  'periodic',
  'image',
]);

const SYSTEM_CHAT_ID = 'saved-messages';

export function importFromJSON(json: string, mode: ImportMode): ImportResult {
  const data = JSON.parse(json);
  const t = getDictionary(getSettings().locale);

  const schemaVersion = Number(data.schema_version);
  if (
    !Number.isFinite(schemaVersion) ||
    schemaVersion < MIN_SUPPORTED_EXPORT_SCHEMA ||
    schemaVersion > MAX_SUPPORTED_EXPORT_SCHEMA ||
    !Array.isArray(data.chats)
  ) {
    throw new Error(t.invalidFormat);
  }

  const db = getDatabase();
  const result: ImportResult = {
    chatsAdded: 0,
    chatsUpdated: 0,
    messagesAdded: 0,
    messagesUpdated: 0,
    settingsImported: false,
  };

  db.executeSync('BEGIN TRANSACTION');
  try {
    if (mode === 'replace') {
      db.executeSync('DELETE FROM messages');
      db.executeSync('DELETE FROM chat_read_markers');
      db.executeSync('DELETE FROM chats');
    }

    for (const chat of data.chats) {
      if (!chat?.id || typeof chat.title !== 'string') {
        throw new Error(t.invalidFormat);
      }

      const isSystem =
        chat.isSystem === true ||
        chat.isSystem === 1 ||
        chat.id === SYSTEM_CHAT_ID
          ? 1
          : 0;

      const existing = getChatById(chat.id);

      if (mode === 'merge' && existing) {
        if (chat.updatedAt > existing.updatedAt) {
          db.executeSync(
            'UPDATE chats SET title = ?, avatar_path = ?, is_system = ?, created_at = ?, updated_at = ? WHERE id = ?',
            [
              chat.title,
              chat.avatarPath ?? null,
              isSystem,
              chat.createdAt,
              chat.updatedAt,
              chat.id,
            ],
          );
          result.chatsUpdated++;
        } else if (isSystem && !existing.isSystem) {
          db.executeSync('UPDATE chats SET is_system = 1 WHERE id = ?', [
            chat.id,
          ]);
        }
      } else {
        db.executeSync(
          'INSERT INTO chats (id, title, avatar_path, is_system, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
          [
            chat.id,
            chat.title,
            chat.avatarPath ?? null,
            isSystem,
            chat.createdAt,
            chat.updatedAt,
          ],
        );
        result.chatsAdded++;
      }

      for (const msg of chat.messages ?? []) {
        if (!msg?.id || !ALLOWED_MESSAGE_TYPES.has(msg.type)) {
          throw new Error(t.invalidFormat);
        }

        const body = typeof msg.body === 'string' ? msg.body : '';
        const bodyLc = normalizeSearchText(body);
        const existingMsg = getMessageById(msg.id);

        if (mode === 'merge' && existingMsg) {
          if (msg.updatedAt > existingMsg.updatedAt) {
            db.executeSync(
              `UPDATE messages SET chat_id = ?, type = ?, body = ?, body_lc = ?, scheduled_at = ?, interval_minutes = ?, enabled = ?, payload = ?, created_at = ?, updated_at = ? WHERE id = ?`,
              [
                chat.id,
                msg.type,
                body,
                bodyLc,
                msg.scheduledAt ?? null,
                msg.intervalMinutes ?? null,
                msg.enabled ? 1 : 0,
                msg.payload ?? null,
                msg.createdAt,
                msg.updatedAt,
                msg.id,
              ],
            );
            result.messagesUpdated++;
          }
        } else {
          db.executeSync(
            `INSERT INTO messages (id, chat_id, type, body, body_lc, scheduled_at, interval_minutes, enabled, payload, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              msg.id,
              chat.id,
              msg.type,
              body,
              bodyLc,
              msg.scheduledAt ?? null,
              msg.intervalMinutes ?? null,
              msg.enabled ? 1 : 0,
              msg.payload ?? null,
              msg.createdAt,
              msg.updatedAt,
            ],
          );
          result.messagesAdded++;
        }
      }
    }

    // Always protect the system Saved chat after import
    db.executeSync(
      'UPDATE chats SET is_system = 1 WHERE id = ?',
      [SYSTEM_CHAT_ID],
    );

    if (data.readMarkers && typeof data.readMarkers === 'object') {
      for (const [chatId, lastReadAt] of Object.entries(data.readMarkers)) {
        if (typeof lastReadAt !== 'string') continue;
        const chatExists = getChatById(chatId);
        if (!chatExists) continue;
        db.executeSync(
          'INSERT OR REPLACE INTO chat_read_markers (chat_id, last_read_at) VALUES (?, ?)',
          [chatId, lastReadAt],
        );
      }
    }

    if (data.settings) {
      updateSettings(data.settings as AppSettings);
      result.settingsImported = true;
    }

    db.executeSync('COMMIT');
  } catch (e) {
    db.executeSync('ROLLBACK');
    throw e;
  }

  return result;
}
