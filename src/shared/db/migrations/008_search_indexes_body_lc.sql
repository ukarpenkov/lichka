-- Migration 8: search + integrity indexes, body_lc, FK on read markers
-- Note: body_lc backfill is done in JS (Unicode lower) inside db.ts after SQL.

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
