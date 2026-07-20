-- Migration 5: system chat flag
ALTER TABLE chats ADD COLUMN is_system INTEGER NOT NULL DEFAULT 0;
