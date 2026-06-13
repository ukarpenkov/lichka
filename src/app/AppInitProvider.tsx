import React, { createContext, useContext, useEffect, useState } from 'react';
import { runMigrations } from '../shared/db';
import { registerNotificationChannels, cleanupOrphanMedia } from '../shared/lib';
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
        runMigrations();
        seedDefaultChat();
        registerNotificationChannels();
        cleanupOrphanMedia().catch(() => {});

        if (!cancelled) {
          setState({ status: 'ready' });
        }
      } catch (e) {
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
