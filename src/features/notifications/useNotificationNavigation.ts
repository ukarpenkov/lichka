import { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import { getInitialChatId, consumeInitialChatId } from '../../shared/lib/notificationChannels';

export function useNotificationNavigation() {
  const navigation = useNavigation<any>();
  const hasHandledInitial = useRef(false);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    // Cold start: check initial chatId from notification intent
    if (!hasHandledInitial.current) {
      getInitialChatId().then((chatId) => {
        if (chatId) {
          hasHandledInitial.current = true;
          consumeInitialChatId();
          navigation.navigate('ChatsTab', {
            screen: 'ChatRoom',
            params: { chatId },
          });
        }
      });
    }

    // Warm start: listen for events from native
    const emitter = new NativeEventEmitter(NativeModules.NotificationModule);
    const sub = emitter.addListener('onNotificationOpen', (event: { chatId: string }) => {
      navigation.navigate('ChatsTab', {
        screen: 'ChatRoom',
        params: { chatId: event.chatId },
      });
    });
    return () => sub.remove();
  }, [navigation]);
}
