import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getDatabase } from '../db';
import {
  type Locale,
  type LocaleDictionary,
  dictionaries,
  getDictionary,
  getSystemLocale,
  SUPPORTED_LOCALES,
} from './locale';

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

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    const db = getDatabase();
    db.executeSync(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      [SETTINGS_KEY, next],
    );
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
