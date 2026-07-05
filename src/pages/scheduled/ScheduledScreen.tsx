import React, { useState, useCallback, useRef } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { Screen, Text } from '../../shared/ui';
import { useTheme, useLocale } from '../../shared/config';
import { getScheduledMessages, disableFiredMessages, type Message } from '../../entities/message';
import { getChatById } from '../../entities/chat';

import { ScheduledItem } from './ScheduledItem';

type ScheduledEntry = {
  message: Message;
  chatTitle: string;
};

const REFRESH_INTERVAL = 15_000;

export function ScheduledScreen() {
  const navigation = useNavigation();
  const { text } = useTheme();
  const { t } = useLocale();
  const [entries, setEntries] = useState<ScheduledEntry[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadEntries = useCallback(() => {
    disableFiredMessages();
    const messages = getScheduledMessages();
    const items: ScheduledEntry[] = [];
    for (const msg of messages) {
      const chat = getChatById(msg.chatId);
      items.push({ message: msg, chatTitle: chat?.title ?? '—' });
    }
    setEntries(items);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
      timerRef.current = setInterval(loadEntries, REFRESH_INTERVAL);
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }, [loadEntries]),
  );

  const handlePress = useCallback(
    (entry: ScheduledEntry) => {
      (navigation as any).navigate('ChatsTab', {
        screen: 'ChatRoom',
        params: { chatId: entry.message.chatId, messageId: entry.message.id },
      });
    },
    [navigation],
  );

  return (
    <Screen>
      {entries.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="body" style={{ color: text + '80' }}>
            {t.noScheduled}
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.message.id}
          renderItem={({ item }) => (
            <ScheduledItem
              message={item.message}
              chatTitle={item.chatTitle}
              onPress={() => handlePress(item)}
            />
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
