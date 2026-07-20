import { open, type DB } from '@op-engineering/op-sqlite';
import { normalizeSearchText } from './normalizeSearchText';

const DB_NAME = 'lichka.db';

type MigrationDef =
  | string
  | {
      sql: string;
      after?: (db: DB) => void;
    };

const MIGRATIONS: Record<number, MigrationDef> = {
  1: `
    CREATE TABLE IF NOT EXISTS chats (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      avatar_path TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY NOT NULL,
      chat_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('simple', 'reminder', 'alarm', 'periodic')),
      body TEXT NOT NULL DEFAULT '',
      scheduled_at TEXT,
      interval_minutes INTEGER,
      enabled INTEGER,
      payload TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY
    );
  `,
  // TODO: re-enable as a NEW migration number (never reuse 2) when op-sqlite ships FTS5
  // 2 was FTS5 — skipped intentionally (gap in applied versions is OK)
  3: `
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT
    );
  `,
  4: `
    UPDATE messages
    SET body = '[voice:' || CAST(CAST(SUBSTR(body, INSTR(body, ' ') + 1) AS INTEGER) AS TEXT) || ']'
    WHERE body LIKE '[Голосовое %';
  `,
  5: `
    ALTER TABLE chats ADD COLUMN is_system INTEGER NOT NULL DEFAULT 0;
  `,
  6: `
    CREATE TABLE messages_new (
      id TEXT PRIMARY KEY NOT NULL,
      chat_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('simple', 'reminder', 'alarm', 'periodic', 'image')),
      body TEXT NOT NULL DEFAULT '',
      scheduled_at TEXT,
      interval_minutes INTEGER,
      enabled INTEGER,
      payload TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
    );

    INSERT INTO messages_new SELECT * FROM messages;
    DROP TABLE messages;
    ALTER TABLE messages_new RENAME TO messages;
  `,
  7: `
    CREATE TABLE IF NOT EXISTS chat_read_markers (
      chat_id TEXT PRIMARY KEY NOT NULL,
      last_read_at TEXT NOT NULL
    );
  `,
  8: {
    sql: `
      ALTER TABLE messages ADD COLUMN body_lc TEXT;
      CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
      CREATE INDEX IF NOT EXISTS idx_messages_body_lc ON messages(body_lc);
      CREATE INDEX IF NOT EXISTS idx_messages_scheduled_at ON messages(scheduled_at);

      CREATE TABLE IF NOT EXISTS chat_read_markers_new (
        chat_id TEXT PRIMARY KEY NOT NULL,
        last_read_at TEXT NOT NULL,
        FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
      );
      INSERT OR IGNORE INTO chat_read_markers_new (chat_id, last_read_at)
        SELECT m.chat_id, m.last_read_at
        FROM chat_read_markers m
        INNER JOIN chats c ON c.id = m.chat_id;
      DROP TABLE chat_read_markers;
      ALTER TABLE chat_read_markers_new RENAME TO chat_read_markers;
    `,
    after: (db) => {
      const result = db.executeSync('SELECT id, body FROM messages');
      for (const row of result.rows) {
        db.executeSync('UPDATE messages SET body_lc = ? WHERE id = ?', [
          normalizeSearchText(String(row.body ?? '')),
          row.id as string,
        ]);
      }
    },
  },
};

let dbInstance: DB | null = null;

export function getDatabase(): DB {
  if (!dbInstance) {
    dbInstance = open({ name: DB_NAME });
    dbInstance.executeSync('PRAGMA foreign_keys = ON');
  }
  return dbInstance;
}

function migrationSql(def: MigrationDef): string {
  return typeof def === 'string' ? def : def.sql;
}

function migrationAfter(def: MigrationDef): ((db: DB) => void) | undefined {
  return typeof def === 'string' ? undefined : def.after;
}

export function runMigrations(): void {
  const db = getDatabase();

  db.executeSync(
    'CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY)',
  );

  const result = db.executeSync(
    'SELECT version FROM schema_migrations ORDER BY version',
  );
  const applied = new Set<number>(
    result.rows.map((r) => r.version as number),
  );

  const versions = Object.keys(MIGRATIONS)
    .map(Number)
    .sort((a, b) => a - b);

  for (const version of versions) {
    if (applied.has(version)) continue;

    const def = MIGRATIONS[version];
    db.executeSync('BEGIN TRANSACTION');
    try {
      const sql = migrationSql(def);
      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const stmt of statements) {
        db.executeSync(stmt);
      }

      migrationAfter(def)?.(db);

      db.executeSync(
        'INSERT INTO schema_migrations (version) VALUES (?)',
        [version],
      );

      db.executeSync('COMMIT');
    } catch (e) {
      db.executeSync('ROLLBACK');
      throw e;
    }
  }
}
