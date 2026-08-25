import { useCallback, useEffect } from 'react';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

import {
  consumeInitialShare,
  getInitialShare,
  type NativeSharePayload,
} from '../../shared/lib/shareIntent';
import { setNavigationReady } from '../../app/mainTabsApi';
import { handleShareReceived } from './shareIntoChat';

export function useShareNavigation() {
  useEffect(() => {
    setNavigationReady();
  }, []);

  const onShare = useCallback((event: NativeSharePayload) => {
    handleShareReceived(event);
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    let cancelled = false;
    let initialHandled = false;

    getInitialShare().then((payload) => {
      if (cancelled || initialHandled) return;
      if (!payload) return;
      if (!payload.text && !payload.imagePath) return;
      initialHandled = true;
      consumeInitialShare();
      onShare(payload);
    });

    const emitter = new NativeEventEmitter(NativeModules.ShareModule);
    const sub = emitter.addListener(
      'onShareReceived',
      (event: NativeSharePayload) => {
        if (cancelled) return;
        if (!event?.text && !event?.imagePath) return;
        initialHandled = true;
        onShare(event);
      },
    );
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, [onShare]);
}
