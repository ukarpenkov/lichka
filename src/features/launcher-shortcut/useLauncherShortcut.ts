import { useCallback, useEffect } from 'react';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

import {
  consumeInitialShortcut,
  getInitialShortcutId,
} from '../../shared/lib/launcherShortcut';
import { navigateToChat, setNavigationReady } from '../../app/mainTabsApi';

export const SAVED_MESSAGES_CHAT_ID = 'saved-messages';
export const SHORTCUT_WRITE_SAVED = 'write_saved';

export function handleLauncherShortcut(shortcutId: string): void {
  if (shortcutId !== SHORTCUT_WRITE_SAVED) return;
  navigateToChat(SAVED_MESSAGES_CHAT_ID, undefined, { composerFocus: true });
}

export function useLauncherShortcut() {
  useEffect(() => {
    setNavigationReady();
  }, []);

  const onOpen = useCallback((shortcutId: string) => {
    handleLauncherShortcut(shortcutId);
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    let cancelled = false;
    let initialHandled = false;

    getInitialShortcutId()
      .then((shortcutId) => {
        if (cancelled || initialHandled) return;
        if (!shortcutId) return;
        initialHandled = true;
        consumeInitialShortcut();
        onOpen(shortcutId);
      })
      .catch(() => {
        // Native module missing or bridge not ready — ignore.
      });

    const shortcutNative = NativeModules.ShortcutModule;
    if (!shortcutNative) {
      return () => {
        cancelled = true;
      };
    }

    const emitter = new NativeEventEmitter(shortcutNative);
    const sub = emitter.addListener(
      'onShortcutOpen',
      (event: { shortcutId?: string }) => {
        if (cancelled) return;
        if (!event?.shortcutId) return;
        initialHandled = true;
        onOpen(event.shortcutId);
      },
    );
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, [onOpen]);
}
