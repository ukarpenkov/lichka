import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { NativeModules, Platform } from 'react-native';
import { getDatabase } from '../db';
import { getTheme, DEFAULT_LIGHT, type ThemePreset } from './theme';
import { resolveSemanticColors, type SemanticColors } from './tokens';

const SETTINGS_KEY = 'theme_preset_id';

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
    if (result.rows.length > 0) {
      const id = result.rows[0].value as string;
      const theme = getTheme(id);
      setPreset(theme);
      if (Platform.OS === 'android' && NativeModules.ThemeModule) {
        NativeModules.ThemeModule.setTheme(theme.background, theme.text);
      }
    }
  }, []);

  const setTheme = useCallback((id: string) => {
    const next = getTheme(id);
    setPreset(next);
    const db = getDatabase();
    db.executeSync(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      [SETTINGS_KEY, id],
    );
    if (Platform.OS === 'android' && NativeModules.ThemeModule) {
      NativeModules.ThemeModule.setTheme(next.background, next.text);
    }
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
