-- Migration 7: per-chat unread markers
CREATE TABLE IF NOT EXISTS chat_read_markers (
  chat_id TEXT PRIMARY KEY NOT NULL,
  last_read_at TEXT NOT NULL
);
