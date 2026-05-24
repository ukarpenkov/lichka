import React from 'react';
import { ThemeProvider } from './src/shared/config/ThemeProvider';
import { runMigrations } from './src/shared/db';
import { AppNavigator } from './src/app/AppNavigator';

runMigrations();

function App(): React.JSX.Element {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}

export default App;
