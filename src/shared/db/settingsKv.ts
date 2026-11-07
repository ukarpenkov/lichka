import { getDatabase } from './db';

export function readSetting(key: string): string | null {
  const result = getDatabase().executeSync(
    'SELECT value FROM settings WHERE key = ?',
    [key],
  );
  if (result.rows.length === 0) return null;
  return result.rows[0].value as string;
}

export function writeSetting(key: string, value: string): void {
  getDatabase().executeSync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key, value],
  );
}
