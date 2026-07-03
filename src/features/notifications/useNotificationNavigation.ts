import { useCallback, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import { getInitialChatId, getInitialMessageId, consumeInitialChatId } from '../../shared/lib/notificationChannels';

let pendingPayload: { chatId: string; messageId?: string } | null = null;
let navReady = false;

export function setNavigationReady() {
  navReady = true;
  if (pendingPayload && navRef) {
    const p = pendingPayload;
    pendingPayload = null;
    navRef('ChatsTab', { screen: 'ChatRoom', params: { chatId: p.chatId, messageId: p.messageId } });
  }
}

type NavigateFn = (name: string, params: any) => void;
let navRef: NavigateFn | null = null;

export function useNotificationNavigation() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    navRef = (name: string, params: any) => navigation.navigate(name, params);
    if (navigation.isReady?.()) {
      setNavigationReady();
    }
  }, [navigation]);

  const navigateToChat = useCallback((chatId: string, messageId?: string) => {
    if (navReady && navRef) {
      navRef('ChatsTab', { screen: 'ChatRoom', params: { chatId, messageId } });
    } else {
      pendingPayload = { chatId, messageId };
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    Promise.all([getInitialChatId(), getInitialMessageId()]).then(
      ([chatId, messageId]) => {
        if (chatId) {
          consumeInitialChatId();
          navigateToChat(chatId, messageId || undefined);
        }
      },
    );

    const emitter = new NativeEventEmitter(NativeModules.NotificationModule);
    const sub = emitter.addListener(
      'onNotificationOpen',
      (event: { chatId: string; messageId?: string }) => {
        if (event.chatId) {
          navigateToChat(event.chatId, event.messageId);
        }
      },
    );
    return () => sub.remove();
  }, [navigateToChat]);
}
