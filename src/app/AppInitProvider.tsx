import React, { createContext, useContext, useEffect, useState } from 'react';
import { runMigrations } from '../shared/db';
import { registerNotificationChannels, cleanupOrphanMedia } from '../shared/lib';
import { requestNotificationPermission } from '../features/notifications';
import { seedDefaultChat } from '../entities/chat';
import { getSettings } from '../entities/settings';

type InitState =
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'error'; error: Error };

const InitContext = createContext<InitState>({ status: 'loading' });

export function useAppInit(): InitState {
  return useContext(InitContext);
}

function runInitStep(label: string, action: () => void): void {
  try {
    action();
  } catch (e) {
    throw new Error(
      `${label}: ${e instanceof Error ? e.message : String(e)}`,
    );
  }
}

export function AppInitProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<InitState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        runInitStep('Database migration failed', runMigrations);
        runInitStep('Seed default chat failed', seedDefaultChat);

        getSettings();

        runInitStep('Notification channels failed', registerNotificationChannels);

        requestNotificationPermission().catch(() => {});
        cleanupOrphanMedia().catch(() => {});

        if (!cancelled) {
          setState({ status: 'ready' });
        }
      } catch (e) {
        console.error('[AppInit]', e);
        if (!cancelled) {
          setState({ status: 'error', error: e instanceof Error ? e : new Error(String(e)) });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return <InitContext.Provider value={state}>{children}</InitContext.Provider>;
}
