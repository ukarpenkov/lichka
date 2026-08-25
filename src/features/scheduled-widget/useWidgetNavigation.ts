import { useCallback, useEffect } from 'react';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

import {
  getInitialWidgetOpenTarget,
  getInitialWidgetMessageId,
  consumeInitialWidgetOpen,
} from '../../shared/lib/scheduledWidget';
import { openScheduledTab, setNavigationReady } from '../../app/mainTabsApi';

const OPEN_TARGET_SCHEDULED = 'scheduled';

export function handleWidgetOpen(openTarget: string, messageId?: string | null): void {
  if (openTarget !== OPEN_TARGET_SCHEDULED) return;
  openScheduledTab(messageId || undefined);
}

export function useWidgetNavigation() {
  useEffect(() => {
    setNavigationReady();
  }, []);

  const onOpen = useCallback((openTarget: string, messageId?: string | null) => {
    handleWidgetOpen(openTarget, messageId);
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    let cancelled = false;
    let handled = false;

    const openOnce = (openTarget: string, messageId?: string | null) => {
      if (cancelled || handled) return;
      handled = true;
      consumeInitialWidgetOpen();
      onOpen(openTarget, messageId);
    };

    Promise.all([getInitialWidgetOpenTarget(), getInitialWidgetMessageId()]).then(
      ([openTarget, messageId]) => {
        if (openTarget) {
          openOnce(openTarget, messageId);
        }
      },
    );

    const emitter = new NativeEventEmitter(NativeModules.WidgetModule);
    const sub = emitter.addListener(
      'onWidgetOpen',
      (event: { openTarget: string; messageId?: string }) => {
        if (event.openTarget) {
          openOnce(event.openTarget, event.messageId);
        }
      },
    );
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, [onOpen]);
}
