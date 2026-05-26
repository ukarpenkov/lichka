import RNFS from 'react-native-fs';
import { getDatabase } from '../db';
import { MEDIA_DIR } from './mediaPath';

/**
 * Remove orphan media files that have no corresponding DB reference.
 * Walks media/ subdirectories and cross-references with chats.avatar_path
 * and messages.payload->uri in the database.
 */
export async function cleanupOrphanMedia(): Promise<{ removed: string[] }> {
  const db = getDatabase();
  const removed: string[] = [];

  const referenced = new Set<string>();

  const chats = db.executeSync(
    'SELECT avatar_path FROM chats WHERE avatar_path IS NOT NULL',
  );
  for (const row of chats.rows) {
    if (row.avatar_path) referenced.add(row.avatar_path as string);
  }

  const messages = db.executeSync(
    'SELECT payload FROM messages WHERE payload IS NOT NULL',
  );
  for (const row of messages.rows) {
    try {
      const parsed = JSON.parse(row.payload as string);
      if (parsed.uri) referenced.add(parsed.uri);
    } catch {
      // skip non-JSON payloads
    }
  }

  const mediaExists = await RNFS.exists(MEDIA_DIR);
  if (!mediaExists) return { removed };

  const subdirs = await RNFS.readDir(MEDIA_DIR);

  for (const sub of subdirs) {
    if (!sub.isDirectory()) continue;

    const files = await RNFS.readDir(sub.path);
    for (const file of files) {
      if (!file.isFile()) continue;

      const relativePath = `media/${sub.name}/${file.name}`;

      if (!referenced.has(relativePath)) {
        try {
          await RNFS.unlink(file.path);
          removed.push(relativePath);
        } catch {
          // file may be locked or already gone
        }
      }
    }
  }

  return { removed };
}
