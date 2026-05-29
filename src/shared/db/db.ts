import { open, type DB } from '@op-engineering/op-sqlite';

const DB_NAME = 'lichka.db';

const MIGRATIONS: Record<number, string> = {
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
  // TODO: re-enable when op-sqlite is built with FTS5 support (add op-sqlite.json)
  // 2: `
  //   CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(
  //     body,
  //     content=messages,
  //     content_rowid=rowid
  //   );
  //   ...
  // `,
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
};

let dbInstance: DB | null = null;

export function getDatabase(): DB {
  if (!dbInstance) {
    dbInstance = open({ name: DB_NAME });
  }
  return dbInstance;
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

    db.executeSync('BEGIN TRANSACTION');
    try {
      const sql = MIGRATIONS[version];
      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const stmt of statements) {
        db.executeSync(stmt);
      }

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
