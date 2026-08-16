import { NativeModules, Platform } from 'react-native';
import type { LocaleBundle, LocaleDictionary } from './types';
import { ru } from './ru';
import { en } from './en';
import { es } from './es';
import { de } from './de';
import { fr } from './fr';
import { pt } from './pt';

export type { LocaleDictionary, DateLocaleConfig, LocaleBundle } from './types';

/** Locale registry: adding a language = 1 bundle file + 1 entry here. */
const bundles = { ru, en, es, de, fr, pt } as const;

export type Locale = keyof typeof bundles;

export const SUPPORTED_LOCALES = Object.keys(bundles) as Locale[];

export const dictionaries: Record<Locale, LocaleDictionary> = {
  ru: ru.dictionary,
  en: en.dictionary,
  es: es.dictionary,
  de: de.dictionary,
  fr: fr.dictionary,
  pt: pt.dictionary,
};

/** Full locale bundle (strings + months + date rules). */
export function getLocaleBundle(locale: Locale): LocaleBundle {
  return bundles[locale];
}

/** Get dictionary for any locale string (safe for non-React modules) */
export function getDictionary(locale: string): LocaleDictionary {
  return dictionaries[locale as Locale] ?? en.dictionary;
}

/** Detect system locale, fallback to 'en' */
export function getSystemLocale(): Locale {
  try {
    const deviceLocale =
      Platform.OS === 'ios'
        ? NativeModules.SettingsManager?.settings?.AppleLocale ||
          NativeModules.SettingsManager?.settings?.AppleLanguages?.[0]
        : NativeModules.I18nManager?.localeIdentifier;

    if (typeof deviceLocale === 'string') {
      const lang = deviceLocale.split(/[-_]/)[0].toLowerCase();
      if (SUPPORTED_LOCALES.includes(lang as Locale)) {
        return lang as Locale;
      }
    }
  } catch {
    // ignore
  }
  return 'en';
}
