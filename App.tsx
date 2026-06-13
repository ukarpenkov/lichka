import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { ThemeProvider } from './src/shared/config/ThemeProvider';
import { DEFAULT_LIGHT, getTheme } from './src/shared/config/theme';
import { LocaleProvider } from './src/shared/config/LocaleProvider';
import { SharedElementProvider } from './src/shared/ui';
import { AppInitProvider, useAppInit } from './src/app/AppInitProvider';
import { ErrorBoundary } from './src/app/ErrorBoundary';
import { AppNavigator } from './src/app/AppNavigator';
import { getDatabase } from './src/shared/db';

function readThemeSnapshot(): { bg: string; fg: string } {
  try {
    const db = getDatabase();
    const result = db.executeSync(
      "SELECT value FROM settings WHERE key = 'theme_preset_id'",
    );
    if (result.rows.length > 0) {
      const id = result.rows[0].value as string;
      const preset = getTheme(id);
      return { bg: preset.background, fg: preset.text };
    }
  } catch {
    // DB not ready
  }
  return { bg: DEFAULT_LIGHT.background, fg: DEFAULT_LIGHT.text };
}

function LoadingScreen() {
  const [colors, setColors] = useState({ bg: DEFAULT_LIGHT.background, fg: DEFAULT_LIGHT.text });

  useEffect(() => {
    setColors(readThemeSnapshot());
  }, []);

  return (
    <View style={[styles.loading, { backgroundColor: colors.bg }]}>
      <ActivityIndicator size="large" color={colors.fg} />
    </View>
  );
}

function AppContent() {
  const init = useAppInit();

  if (init.status === 'loading') {
    return <LoadingScreen />;
  }

  if (init.status === 'error') {
    throw init.error;
  }

  return (
    <ThemeProvider>
      <LocaleProvider>
        <BottomSheetModalProvider>
          <SharedElementProvider>
            <AppNavigator />
          </SharedElementProvider>
        </BottomSheetModalProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <AppInitProvider>
          <AppContent />
        </AppInitProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

export default App;

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
