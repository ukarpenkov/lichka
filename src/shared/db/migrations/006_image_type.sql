-- Migration 6: allow message type 'image' (table rebuild for CHECK constraint)
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
