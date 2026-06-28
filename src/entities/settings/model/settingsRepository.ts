import { getDatabase } from '../../../shared/db';
import type { AppSettings } from './types';

const DEFAULTS: AppSettings = {
  themePresetId: 'light',
  hapticEnabled: true,
  soundEnabled: true,
  locale: 'en',
};

const KEYS: (keyof AppSettings)[] = ['themePresetId', 'hapticEnabled', 'soundEnabled', 'locale'];

const DB_KEYS: Record<keyof AppSettings, string> = {
  themePresetId: 'theme_preset_id',
  hapticEnabled: 'haptic_enabled',
  soundEnabled: 'sound_enabled',
  locale: 'locale',
};

export function getSettings(): AppSettings {
  const db = getDatabase();
  const result = db.executeSync('SELECT key, value FROM settings');

  const map = new Map<string, string>();
  for (const row of result.rows) {
    map.set(row.key as string, row.value as string);
  }

  return {
    themePresetId: map.get(DB_KEYS.themePresetId) ?? DEFAULTS.themePresetId,
    hapticEnabled: map.get(DB_KEYS.hapticEnabled) === '1' ? true : map.get(DB_KEYS.hapticEnabled) === '0' ? false : DEFAULTS.hapticEnabled,
    soundEnabled: map.get(DB_KEYS.soundEnabled) === '1' ? true : map.get(DB_KEYS.soundEnabled) === '0' ? false : DEFAULTS.soundEnabled,
    locale: map.get(DB_KEYS.locale) ?? DEFAULTS.locale,
  };
}

export function updateSettings(partial: Partial<AppSettings>): AppSettings {
  const db = getDatabase();
  for (const key of KEYS) {
    if (key in partial) {
      const dbKey = DB_KEYS[key];
      const value = partial[key];
      let strValue: string;

      if (typeof value === 'boolean') {
        strValue = value ? '1' : '0';
      } else {
        strValue = String(value);
      }

      db.executeSync(
        'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?',
        [dbKey, strValue, strValue],
      );
    }
  }

  return getSettings();
}
