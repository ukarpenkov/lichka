import { useCallback, useEffect } from 'react';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

import {
  getInitialChatId,
  getInitialMessageId,
  consumeInitialChatId,
} from '../../shared/lib/notificationChannels';
import { setNavigationReady, navigateToChat } from '../../app/mainTabsApi';

export function useNotificationNavigation() {
  useEffect(() => {
    setNavigationReady();
  }, []);

  const navigateToChatRoom = useCallback((chatId: string, messageId?: string) => {
    navigateToChat(chatId, messageId);
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    Promise.all([getInitialChatId(), getInitialMessageId()]).then(
      ([chatId, messageId]) => {
        if (chatId) {
          consumeInitialChatId();
          navigateToChatRoom(chatId, messageId || undefined);
        }
      },
    );

    const emitter = new NativeEventEmitter(NativeModules.NotificationModule);
    const sub = emitter.addListener(
      'onNotificationOpen',
      (event: { chatId: string; messageId?: string }) => {
        if (event.chatId) {
          navigateToChatRoom(event.chatId, event.messageId);
        }
      },
    );
    return () => sub.remove();
  }, [navigateToChatRoom]);
}
