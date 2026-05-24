import React, { useEffect } from 'react';
import { ThemeProvider } from './src/shared/config/ThemeProvider';
import { runMigrations } from './src/shared/db';
import { AppNavigator } from './src/app/AppNavigator';

function App(): React.JSX.Element {
  useEffect(() => {
    runMigrations();
  }, []);

  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}

export default App;
