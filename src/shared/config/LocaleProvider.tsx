import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { readSetting, writeSetting } from '../db';
import { useAndroidBackgroundEffect } from '../lib';
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
    const stored = readSetting(SETTINGS_KEY);
    if (stored && SUPPORTED_LOCALES.includes(stored as Locale)) {
      return stored as Locale;
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

  const pushLocale = useCallback(() => {
    pushAndroidWidgetLocale(locale);
  }, [locale]);

  // Re-push on background so the home-screen widget catches the latest copy even if the
  // previous native refresh was deferred or dropped while the app was still foregrounded.
  useAndroidBackgroundEffect(pushLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    writeSetting(SETTINGS_KEY, next);
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
