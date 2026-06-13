import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { ThemeProvider } from './src/shared/config/ThemeProvider';
import { LocaleProvider } from './src/shared/config/LocaleProvider';
import { SharedElementProvider } from './src/shared/ui';
import { runMigrations } from './src/shared/db';
import { registerNotificationChannels, cleanupOrphanMedia } from './src/shared/lib';
import { seedDefaultChat } from './src/entities/chat';
import { AppNavigator } from './src/app/AppNavigator';

runMigrations();
seedDefaultChat();
registerNotificationChannels();
cleanupOrphanMedia();

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <LocaleProvider>
          <BottomSheetModalProvider>
            <SharedElementProvider>
              <AppNavigator />
            </SharedElementProvider>
          </BottomSheetModalProvider>
        </LocaleProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default App;
