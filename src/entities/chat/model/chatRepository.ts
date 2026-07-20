import { getDatabase } from '../../../shared/db';
import { generateId } from '../../../shared/lib';
import type { Chat } from './types';

const DEFAULT_CHAT_ID = 'saved-messages';
const DEFAULT_CHAT_TITLE = 'Saved';
/** Previous default title — migrated to DEFAULT_CHAT_TITLE on launch. */
const LEGACY_DEFAULT_CHAT_TITLE = 'Saved messages';
/** Streamline Pixel: social-rewards-certified-ribbon */
const DEFAULT_CHAT_ICON = 'social-rewards-certified-ribbon';
const LEGACY_DEFAULT_CHAT_EMOJI = '🔖';

export function createChat(
  title: string,
  avatarPath?: string | null,
  options?: { id?: string; isSystem?: boolean },
): Chat {
  const db = getDatabase();
  const id = options?.id ?? generateId();
  const now = new Date().toISOString();
  const path = avatarPath ?? null;
  const isSystem = options?.isSystem ? 1 : 0;

  db.executeSync(
    'INSERT INTO chats (id, title, avatar_path, is_system, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, title, path, isSystem, now, now],
  );

  return { id, title, avatarPath: path, isSystem: !!isSystem, createdAt: now, updatedAt: now };
}

export function getChats(): Chat[] {
  const db = getDatabase();
  const result = db.executeSync(
    'SELECT id, title, avatar_path, is_system, created_at, updated_at FROM chats ORDER BY updated_at DESC',
  );

  return result.rows.map(mapRow);
}

export function getChatById(id: string): Chat | null {
  const db = getDatabase();
  const result = db.executeSync(
    'SELECT id, title, avatar_path, is_system, created_at, updated_at FROM chats WHERE id = ?',
    [id],
  );

  if (result.rows.length === 0) return null;
  return mapRow(result.rows[0]);
}

export function updateChat(
  id: string,
  fields: { title?: string; avatarPath?: string | null },
): Chat | null {
  const db = getDatabase();
  const existing = getChatById(id);
  if (!existing) return null;

  const title = fields.title ?? existing.title;
  const avatarPath =
    fields.avatarPath !== undefined ? fields.avatarPath : existing.avatarPath;
  const now = new Date().toISOString();

  db.executeSync(
    'UPDATE chats SET title = ?, avatar_path = ?, updated_at = ? WHERE id = ?',
    [title, avatarPath, now, id],
  );

  return { id, title, avatarPath, isSystem: existing.isSystem, createdAt: existing.createdAt, updatedAt: now };
}

export function deleteChat(id: string): boolean {
  const db = getDatabase();
  const chat = getChatById(id);
  if (!chat) return false;
  if (chat.isSystem) return false;

  db.executeSync('DELETE FROM chats WHERE id = ?', [id]);

  if (chat.avatarPath) {
    try {
      const RNFS = require('react-native-fs');
      RNFS.unlink(chat.avatarPath).catch(() => {});
    } catch {
      // react-native-fs not available or file doesn't exist
    }
  }

  return true;
}

export function seedDefaultChat(): void {
  const db = getDatabase();
  const result = db.executeSync('SELECT COUNT(*) AS cnt FROM chats');
  const count = result.rows[0]?.cnt as number;
  if (count > 0) {
    migrateLegacyDefaultChat();
    return;
  }

  createChat(DEFAULT_CHAT_TITLE, DEFAULT_CHAT_ICON, {
    id: DEFAULT_CHAT_ID,
    isSystem: true,
  });
}

/** Icon + short title migrations for the system Saved chat. */
function migrateLegacyDefaultChat(): void {
  const chat = getChatById(DEFAULT_CHAT_ID);
  if (!chat) return;

  const nextIcon =
    chat.avatarPath === LEGACY_DEFAULT_CHAT_EMOJI
      ? DEFAULT_CHAT_ICON
      : undefined;
  const nextTitle =
    chat.title === LEGACY_DEFAULT_CHAT_TITLE ? DEFAULT_CHAT_TITLE : undefined;

  if (nextIcon === undefined && nextTitle === undefined) return;
  updateChat(DEFAULT_CHAT_ID, {
    ...(nextTitle !== undefined ? { title: nextTitle } : {}),
    ...(nextIcon !== undefined ? { avatarPath: nextIcon } : {}),
  });
}

function mapRow(row: Record<string, unknown>): Chat {
  return {
    id: row.id as string,
    title: row.title as string,
    avatarPath: row.avatar_path as string | null,
    isSystem: (row.is_system as number) === 1,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
