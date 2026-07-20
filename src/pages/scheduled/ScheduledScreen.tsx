import React, { useState, useCallback, useRef } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';

import { Screen, Text, PageHeader, AlertDialog, type AlertButton } from '../../shared/ui';
import { useTheme, useLocale } from '../../shared/config';
import {
  getScheduledMessages,
  disableFiredMessages,
  deleteMessage,
  type Message,
} from '../../entities/message';
import { getChatById } from '../../entities/chat';
import { cancelNotification } from '../../features/notifications';
import { useTabVisible } from '../../app/MainTabsContext';
import { navigateToChat } from '../../app/mainTabsApi';

import { ScheduledItem } from './ScheduledItem';

type ScheduledEntry = {
  message: Message;
  chatTitle: string;
};

const REFRESH_INTERVAL = 15_000;

export function ScheduledScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const [entries, setEntries] = useState<ScheduledEntry[]>([]);
  const [dialog, setDialog] = useState<{
    title?: string;
    message?: string;
    buttons?: AlertButton[];
  } | null>(null);
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

  // Таб "Запланировано" (индекс 1). Обновляемся при появлении и чистим таймер при уходе.
  useTabVisible(
    1,
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
      navigateToChat(entry.message.chatId, entry.message.id);
    },
    [],
  );

  const handleLongPress = useCallback(
    (entry: ScheduledEntry) => {
      setDialog({
        title: t.deleteMessage,
        message: t.deleteMessageConfirm,
        buttons: [
          { text: t.cancel, style: 'cancel' },
          {
            text: t.delete,
            style: 'destructive',
            onPress: () => {
              deleteMessage(entry.message.id);
              cancelNotification(entry.message.id);
              loadEntries();
            },
          },
        ],
      });
    },
    [t, loadEntries],
  );

  return (
    <Screen>
      <PageHeader title={t.scheduled} />

      {entries.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="body-sm" tone="muted">
            {t.noScheduled}
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.message.id}
          style={{ backgroundColor: colors.canvas }}
          renderItem={({ item }) => (
            <ScheduledItem
              message={item.message}
              chatTitle={item.chatTitle}
              onPress={() => handlePress(item)}
              onLongPress={() => handleLongPress(item)}
            />
          )}
        />
      )}

      <AlertDialog
        visible={dialog !== null}
        title={dialog?.title}
        message={dialog?.message}
        buttons={dialog?.buttons}
        onClose={() => setDialog(null)}
      />
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
