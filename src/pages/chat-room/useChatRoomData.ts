import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getChatById, type Chat } from '../../entities/chat';
import {
  getVisibleMessagesByChatId,
  getPeriodicDisplayMessages,
  getScheduledMessagesByChatId,
  disableFiredMessages,
  type Message,
} from '../../entities/message';
import { syncScheduledWidgetSnapshot } from '../../features/scheduled-widget';
import { markChatAsRead } from '../../features/unread-badges';

const REFRESH_INTERVAL = 30_000;
const FUTURE_REFRESH_INTERVAL = 15_000;

export function useChatRoomData(chatId: string): {
  chat: Chat | null | undefined;
  messages: Message[];
  futureMessages: Message[];
  loadData: () => void;
  loadFuture: () => void;
} {
  const [chat, setChat] = useState<Chat | null | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [futureMessages, setFutureMessages] = useState<Message[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const futureTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = useCallback(() => {
    setChat(getChatById(chatId) ?? null);
    const regularMessages = getVisibleMessagesByChatId(chatId);
    const periodicMessages = getPeriodicDisplayMessages(chatId);
    const allMessages = [...regularMessages, ...periodicMessages];
    allMessages.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    setMessages(allMessages);
  }, [chatId]);

  const loadFuture = useCallback(() => {
    disableFiredMessages();
    setFutureMessages(getScheduledMessagesByChatId(chatId));
    syncScheduledWidgetSnapshot();
  }, [chatId]);

  useFocusEffect(
    useCallback(() => {
      markChatAsRead(chatId);
      loadData();
      loadFuture();
      timerRef.current = setInterval(loadData, REFRESH_INTERVAL);
      futureTimerRef.current = setInterval(loadFuture, FUTURE_REFRESH_INTERVAL);
      return () => {
        markChatAsRead(chatId);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        if (futureTimerRef.current) {
          clearInterval(futureTimerRef.current);
          futureTimerRef.current = null;
        }
      };
    }, [chatId, loadData, loadFuture]),
  );

  return { chat, messages, futureMessages, loadData, loadFuture };
}
