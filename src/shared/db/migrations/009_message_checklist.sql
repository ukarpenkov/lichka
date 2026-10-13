-- NULL = ordinary message; JSON array = ordered items with id, text, checked.
ALTER TABLE messages ADD COLUMN checklist TEXT;
