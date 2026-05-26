import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { ThemeProvider } from './src/shared/config/ThemeProvider';
import { runMigrations } from './src/shared/db';
import { registerNotificationChannels, cleanupOrphanMedia } from './src/shared/lib';
import { AppNavigator } from './src/app/AppNavigator';

runMigrations();
registerNotificationChannels();
cleanupOrphanMedia();

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <BottomSheetModalProvider>
          <AppNavigator />
        </BottomSheetModalProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default App;
