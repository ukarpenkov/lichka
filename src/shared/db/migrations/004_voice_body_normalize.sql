-- Migration 4: normalize legacy Russian voice body markers to [voice:N]
UPDATE messages
SET body = '[voice:' || CAST(CAST(SUBSTR(body, INSTR(body, ' ') + 1) AS INTEGER) AS TEXT) || ']'
WHERE body LIKE '[Голосовое %';
