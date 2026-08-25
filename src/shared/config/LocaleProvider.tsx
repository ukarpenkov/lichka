import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AppState, Platform, type AppStateStatus } from 'react-native';
import { getDatabase } from '../db';
import { updateScheduledWidgetLocale } from '../lib/scheduledWidget';
import {
  type Locale,
  type LocaleDictionary,
  dictionaries,
  getSystemLocale,
  SUPPORTED_LOCALES,
} from './locale';

function pushAndroidWidgetLocale(locale: Locale): void {
  const dict = dictionaries[locale];
  updateScheduledWidgetLocale(dict.noScheduled, dict.scheduledUntitled);
}

const SETTINGS_KEY = 'locale';

interface LocaleContextValue {
  locale: Locale;
  t: LocaleDictionary;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  t: dictionaries.en,
  setLocale: () => {},
});

function resolveLocale(): Locale {
  // 1. Try reading from DB
  try {
    const db = getDatabase();
    const result = db.executeSync(
      `SELECT value FROM settings WHERE key = '${SETTINGS_KEY}'`,
    );
    if (result.rows.length > 0) {
      const stored = result.rows[0].value as string;
      if (SUPPORTED_LOCALES.includes(stored as Locale)) {
        return stored as Locale;
      }
    }
  } catch {
    // DB not ready yet
  }

  // 2. Fall back to system locale
  return getSystemLocale();
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(resolveLocale);

  useEffect(() => {
    pushAndroidWidgetLocale(locale);
  }, [locale]);

  // Re-push on background so the home-screen widget catches the latest copy even if the
  // previous native refresh was deferred or dropped while the app was still foregrounded.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const onChange = (state: AppStateStatus) => {
      if (state === 'background' || state === 'inactive') {
        pushAndroidWidgetLocale(locale);
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => {
      sub.remove();
    };
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    const db = getDatabase();
    db.executeSync(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      [SETTINGS_KEY, next],
    );
    pushAndroidWidgetLocale(next);
  }, []);

  const value: LocaleContextValue = {
    locale,
    t: dictionaries[locale],
    setLocale,
  };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
