import { getDatabase } from '../../../shared/db';
import { normalizeSearchText } from '../../../shared/db/normalizeSearchText';
import { DEMO_CHATS, PLAY_STORE_DEMO_SEED_KEY } from './demoData';

function isoAt(daysOffset: number, hour: number, minute: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function pastIso(daysAgo: number, hour: number, minute: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  if (d.getTime() > Date.now() - 1000) {
    d.setTime(Date.now() - 60_000);
  }
  return d.toISOString();
}

function futureIso(daysFromNow: number, hour: number, minute: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  if (d.getTime() <= Date.now() + 60_000) {
    d.setDate(d.getDate() + 1);
  }
  return d.toISOString();
}

function insertChat(
  id: string,
  title: string,
  icon: string,
  createdAt: string,
): void {
  const db = getDatabase();
  db.executeSync(
    'INSERT INTO chats (id, title, avatar_path, is_system, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, title, icon, 0, createdAt, createdAt],
  );
}

function insertMessage(fields: {
  id: string;
  chatId: string;
  type: string;
  body: string;
  scheduledAt: string | null;
  intervalMinutes: number | null;
  enabled: number;
  createdAt: string;
}): void {
  const db = getDatabase();
  db.executeSync(
    `INSERT INTO messages (id, chat_id, type, body, body_lc, scheduled_at, interval_minutes, enabled, payload, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      fields.id,
      fields.chatId,
      fields.type,
      fields.body,
      normalizeSearchText(fields.body),
      fields.scheduledAt,
      fields.intervalMinutes,
      fields.enabled,
      null,
      fields.createdAt,
      fields.createdAt,
    ],
  );
}

function isSeeded(): boolean {
  const db = getDatabase();
  const result = db.executeSync('SELECT value FROM settings WHERE key = ?', [
    PLAY_STORE_DEMO_SEED_KEY,
  ]);
  return result.rows[0]?.value === '1';
}

function markSeeded(): void {
  const db = getDatabase();
  db.executeSync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?',
    [PLAY_STORE_DEMO_SEED_KEY, '1', '1'],
  );
  db.executeSync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?',
    ['locale', 'en', 'en'],
  );
}

function wipeExisting(): void {
  const db = getDatabase();
  db.executeSync('DELETE FROM messages');
  db.executeSync('DELETE FROM chat_read_markers');
  db.executeSync('DELETE FROM chats');
}

export function applyPlayStoreDemoSeed(): void {
  if (isSeeded()) return;

  wipeExisting();

  const now = new Date().toISOString();
  let msgSeq = 0;

  for (const chat of DEMO_CHATS) {
    insertChat(chat.id, chat.title, chat.icon, now);

    for (const msg of chat.past) {
      msgSeq += 1;
      const createdAt = pastIso(msg.daysAgo, msg.hour, msg.minute);
      const isTimed = msg.type === 'reminder' || msg.type === 'alarm';
      insertMessage({
        id: `demo-msg-${String(msgSeq).padStart(3, '0')}`,
        chatId: chat.id,
        type: msg.type,
        body: msg.body,
        scheduledAt: isTimed ? createdAt : null,
        intervalMinutes: null,
        enabled: 0,
        createdAt,
      });
    }

    for (const msg of chat.future) {
      msgSeq += 1;
      const scheduledAt = futureIso(msg.daysFromNow, msg.hour, msg.minute);
      insertMessage({
        id: `demo-msg-${String(msgSeq).padStart(3, '0')}`,
        chatId: chat.id,
        type: msg.type,
        body: msg.body,
        scheduledAt,
        intervalMinutes: null,
        enabled: 1,
        createdAt: scheduledAt,
      });
    }

    for (const periodic of chat.periodics) {
      msgSeq += 1;
      const createdAt = isoAt(-periodic.createdDaysAgo, 9, 0);
      insertMessage({
        id: `demo-msg-${String(msgSeq).padStart(3, '0')}`,
        chatId: chat.id,
        type: 'periodic',
        body: periodic.body,
        scheduledAt: createdAt,
        intervalMinutes: periodic.intervalMinutes,
        enabled: 1,
        createdAt,
      });
    }
  }

  markSeeded();
}

export function seedPlayStoreDemo(): void {
  if (!__DEV__) return;
  applyPlayStoreDemoSeed();
}
