import { getDatabase } from '../../shared/db';
import { getChatById } from '../../entities/chat';
import { getMessageById } from '../../entities/message';
import { updateSettings, type AppSettings, getSettings } from '../../entities/settings';
import { getDictionary } from '../../shared/config/locale';

export type ImportMode = 'merge' | 'replace';

export interface ImportResult {
  chatsAdded: number;
  chatsUpdated: number;
  messagesAdded: number;
  messagesUpdated: number;
  settingsImported: boolean;
}

export function importFromJSON(json: string, mode: ImportMode): ImportResult {
  const data = JSON.parse(json);

  if (!data.schema_version || !Array.isArray(data.chats)) {
    const t = getDictionary(getSettings().locale);
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

  if (mode === 'replace') {
    db.executeSync('DELETE FROM messages');
    db.executeSync('DELETE FROM chats');
  }

  for (const chat of data.chats) {
    const existing = getChatById(chat.id);

    if (mode === 'merge' && existing) {
      if (chat.updatedAt > existing.updatedAt) {
        db.executeSync(
          'UPDATE chats SET title = ?, avatar_path = ?, created_at = ?, updated_at = ? WHERE id = ?',
          [chat.title, chat.avatarPath ?? null, chat.createdAt, chat.updatedAt, chat.id],
        );
        result.chatsUpdated++;
      }
    } else {
      db.executeSync(
        'INSERT INTO chats (id, title, avatar_path, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [chat.id, chat.title, chat.avatarPath ?? null, chat.createdAt, chat.updatedAt],
      );
      result.chatsAdded++;
    }

    for (const msg of chat.messages ?? []) {
      const existingMsg = getMessageById(msg.id);

      if (mode === 'merge' && existingMsg) {
        if (msg.updatedAt > existingMsg.updatedAt) {
          db.executeSync(
            `UPDATE messages SET chat_id = ?, type = ?, body = ?, scheduled_at = ?, interval_minutes = ?, enabled = ?, payload = ?, created_at = ?, updated_at = ? WHERE id = ?`,
            [chat.id, msg.type, msg.body, msg.scheduledAt ?? null, msg.intervalMinutes ?? null, msg.enabled ? 1 : 0, msg.payload ?? null, msg.createdAt, msg.updatedAt, msg.id],
          );
          result.messagesUpdated++;
        }
      } else {
        db.executeSync(
          `INSERT INTO messages (id, chat_id, type, body, scheduled_at, interval_minutes, enabled, payload, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [msg.id, chat.id, msg.type, msg.body, msg.scheduledAt ?? null, msg.intervalMinutes ?? null, msg.enabled ? 1 : 0, msg.payload ?? null, msg.createdAt, msg.updatedAt],
        );
        result.messagesAdded++;
      }
    }
  }

  if (data.settings) {
    updateSettings(data.settings as AppSettings);
    result.settingsImported = true;
  }

  return result;
}
