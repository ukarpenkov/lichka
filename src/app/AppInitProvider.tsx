import React, { createContext, useContext, useEffect, useState } from 'react';
import { runMigrations } from '../shared/db';
import { registerNotificationChannels, cleanupOrphanMedia } from '../shared/lib';
import { requestNotificationPermission } from '../features/notifications';
import { seedDefaultChat } from '../entities/chat';

type InitState =
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'error'; error: Error };

const InitContext = createContext<InitState>({ status: 'loading' });

export function useAppInit(): InitState {
  return useContext(InitContext);
}

export function AppInitProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<InitState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        try {
          runMigrations();
        } catch (e) {
          throw new Error(
            `Database migration failed: ${e instanceof Error ? e.message : String(e)}`,
          );
        }

        try {
          seedDefaultChat();
        } catch (e) {
          throw new Error(
            `Seed default chat failed: ${e instanceof Error ? e.message : String(e)}`,
          );
        }

        try {
          registerNotificationChannels();
        } catch (e) {
          throw new Error(
            `Notification channels failed: ${e instanceof Error ? e.message : String(e)}`,
          );
        }

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
