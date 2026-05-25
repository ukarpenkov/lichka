import { getDatabase } from '../../../shared/db';
import { generateId } from '../../../shared/lib';
import type { Chat } from './types';

export function createChat(title: string, avatarPath?: string | null): Chat {
  const db = getDatabase();
  const id = generateId();
  const now = new Date().toISOString();
  const path = avatarPath ?? null;

  db.executeSync(
    'INSERT INTO chats (id, title, avatar_path, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    [id, title, path, now, now],
  );

  return { id, title, avatarPath: path, createdAt: now, updatedAt: now };
}

export function getChats(): Chat[] {
  const db = getDatabase();
  const result = db.executeSync(
    'SELECT id, title, avatar_path, created_at, updated_at FROM chats ORDER BY updated_at DESC',
  );

  return result.rows.map(mapRow);
}

export function getChatById(id: string): Chat | null {
  const db = getDatabase();
  const result = db.executeSync(
    'SELECT id, title, avatar_path, created_at, updated_at FROM chats WHERE id = ?',
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

  return { id, title, avatarPath, createdAt: existing.createdAt, updatedAt: now };
}

export function deleteChat(id: string): boolean {
  const db = getDatabase();
  const chat = getChatById(id);
  if (!chat) return false;

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

function mapRow(row: Record<string, unknown>): Chat {
  return {
    id: row.id as string,
    title: row.title as string,
    avatarPath: row.avatar_path as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
