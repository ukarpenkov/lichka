import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { NativeModules, Platform } from 'react-native';
import { readSetting, writeSetting } from '../db';
import { useAndroidBackgroundEffect } from '../lib';
import { getTheme, DEFAULT_THEME, type ThemePreset } from './theme';
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
  DEFAULT_THEME.background,
  DEFAULT_THEME.text,
);

const ThemeContext = createContext<ThemeContextValue>({
  preset: DEFAULT_THEME,
  background: DEFAULT_THEME.background,
  text: DEFAULT_THEME.text,
  colors: defaultColors,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preset, setPreset] = useState<ThemePreset>(DEFAULT_THEME);

  useEffect(() => {
    const stored = readSetting(SETTINGS_KEY);
    const theme = stored ? getTheme(stored) : DEFAULT_THEME;
    setPreset(theme);
    pushAndroidWidgetTheme(theme.background, theme.text);
  }, []);

  const pushTheme = useCallback(() => {
    pushAndroidWidgetTheme(preset.background, preset.text);
  }, [preset.background, preset.text]);

  // Re-push on background so the home-screen widget catches the latest theme even if the
  // previous native refresh was deferred or dropped while the app was still foregrounded.
  useAndroidBackgroundEffect(pushTheme);

  const setTheme = useCallback((id: string) => {
    const next = getTheme(id);
    setPreset(next);
    writeSetting(SETTINGS_KEY, id);
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
