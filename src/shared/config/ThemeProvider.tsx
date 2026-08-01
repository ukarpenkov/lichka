import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { AppState, NativeModules, Platform, type AppStateStatus } from 'react-native';
import { getDatabase } from '../db';
import { getTheme, DEFAULT_LIGHT, type ThemePreset } from './theme';
import { resolveSemanticColors, type SemanticColors } from './tokens';

const SETTINGS_KEY = 'theme_preset_id';

function pushAndroidWidgetTheme(background: string, text: string): void {
  if (Platform.OS === 'android' && NativeModules.ThemeModule) {
    NativeModules.ThemeModule.setTheme(background, text);
  }
}

interface ThemeContextValue {
  preset: ThemePreset;
  background: string;
  text: string;
  colors: SemanticColors;
  setTheme: (id: string) => void;
}

const defaultColors = resolveSemanticColors(
  DEFAULT_LIGHT.background,
  DEFAULT_LIGHT.text,
);

const ThemeContext = createContext<ThemeContextValue>({
  preset: DEFAULT_LIGHT,
  background: DEFAULT_LIGHT.background,
  text: DEFAULT_LIGHT.text,
  colors: defaultColors,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preset, setPreset] = useState<ThemePreset>(DEFAULT_LIGHT);

  useEffect(() => {
    const db = getDatabase();
    const result = db.executeSync(
      `SELECT value FROM settings WHERE key = '${SETTINGS_KEY}'`,
    );
    const theme =
      result.rows.length > 0
        ? getTheme(result.rows[0].value as string)
        : DEFAULT_LIGHT;
    setPreset(theme);
    pushAndroidWidgetTheme(theme.background, theme.text);
  }, []);

  // Re-push on background so the home-screen widget catches the latest theme even if the
  // previous native refresh was deferred or dropped while the app was still foregrounded.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const onChange = (state: AppStateStatus) => {
      if (state === 'background' || state === 'inactive') {
        pushAndroidWidgetTheme(preset.background, preset.text);
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => {
      sub.remove();
    };
  }, [preset.background, preset.text]);

  const setTheme = useCallback((id: string) => {
    const next = getTheme(id);
    setPreset(next);
    const db = getDatabase();
    db.executeSync(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      [SETTINGS_KEY, id],
    );
    pushAndroidWidgetTheme(next.background, next.text);
  }, []);

  const colors = useMemo(
    () => resolveSemanticColors(preset.background, preset.text),
    [preset.background, preset.text],
  );

  const value: ThemeContextValue = {
    preset,
    background: preset.background,
    text: preset.text,
    colors,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
