import React, { useState, useCallback, useRef, useEffect } from 'react';
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
import { syncScheduledWidgetSnapshot } from '../../features/scheduled-widget';
import { useMainTabs, useTabVisible } from '../../app/MainTabsContext';
import {
  navigateToChat,
  setScheduledFocusListener,
  consumeScheduledFocus,
  SCHEDULED_TAB_INDEX,
  type ScheduledFocusPayload,
} from '../../app/mainTabsApi';

import { ScheduledItem } from './ScheduledItem';
import { getScheduledChatNavigation } from './scheduledNavigation';

type ScheduledEntry = {
  message: Message;
  chatTitle: string;
};

const REFRESH_INTERVAL = 15_000;
const HIGHLIGHT_MS = 1000;

export function ScheduledScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const { activeIndex } = useMainTabs();
  const [entries, setEntries] = useState<ScheduledEntry[]>([]);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [focusNonce, setFocusNonce] = useState(0);
  const [dialog, setDialog] = useState<{
    title?: string;
    message?: string;
    buttons?: AlertButton[];
  } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRetryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<FlatList<ScheduledEntry>>(null);
  const pendingFocusIdRef = useRef<string | null>(null);
  const appliedFocusNonceRef = useRef<number | null>(null);
  const pendingScrollIndexRef = useRef<number | null>(null);
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  const loadEntries = useCallback(() => {
    disableFiredMessages();
    const messages = getScheduledMessages();
    const items: ScheduledEntry[] = [];
    for (const msg of messages) {
      const chat = getChatById(msg.chatId);
      items.push({ message: msg, chatTitle: chat?.title ?? '—' });
    }
    setEntries(items);
    syncScheduledWidgetSnapshot();
  }, []);

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

  useEffect(() => {
    const onFocus = (payload: ScheduledFocusPayload) => {
      pendingFocusIdRef.current = payload.messageId;
      setFocusNonce(payload.focusNonce);
    };
    setScheduledFocusListener(onFocus);
    return () => setScheduledFocusListener(null);
  }, []);

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
        highlightTimerRef.current = null;
      }
      if (scrollRetryRef.current) {
        clearTimeout(scrollRetryRef.current);
        scrollRetryRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (activeIndex === SCHEDULED_TAB_INDEX) return;
    if (scrollRetryRef.current) {
      clearTimeout(scrollRetryRef.current);
      scrollRetryRef.current = null;
    }
  }, [activeIndex]);

  useEffect(() => {
    const messageId = pendingFocusIdRef.current;
    if (messageId && entries.length > 0 && appliedFocusNonceRef.current !== focusNonce) {
      const index = entries.findIndex((e) => e.message.id === messageId);
      appliedFocusNonceRef.current = focusNonce;
      pendingFocusIdRef.current = null;
      consumeScheduledFocus();

      if (index === -1) {
        // Stale widget row: list loaded but id is gone.
        pendingScrollIndexRef.current = null;
        return;
      }

      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
      }
      setHighlightedMessageId(messageId);
      highlightTimerRef.current = setTimeout(() => {
        setHighlightedMessageId(null);
        highlightTimerRef.current = null;
      }, HIGHLIGHT_MS);

      pendingScrollIndexRef.current = index;
    }

    if (activeIndex !== SCHEDULED_TAB_INDEX) {
      return;
    }

    const scrollIndex = pendingScrollIndexRef.current;
    if (scrollIndex == null) {
      return;
    }
    pendingScrollIndexRef.current = null;

    // Instant scroll: animated scrollToIndex mid-swipe fails the pager pan
    // (failOffsetY) and used to spring back to Scheduled.
    listRef.current?.scrollToIndex({
      index: scrollIndex,
      animated: false,
      viewPosition: 0.5,
    });
  }, [entries, focusNonce, activeIndex]);

  const handlePress = useCallback((entry: ScheduledEntry) => {
    const nav = getScheduledChatNavigation(entry.message);
    navigateToChat(nav.chatId, nav.messageId, nav.options);
  }, []);

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
          ref={listRef}
          data={entries}
          keyExtractor={(item) => item.message.id}
          style={{ backgroundColor: colors.canvas }}
          renderItem={({ item }) => (
            <ScheduledItem
              message={item.message}
              chatTitle={item.chatTitle}
              highlighted={item.message.id === highlightedMessageId}
              onPress={() => handlePress(item)}
              onLongPress={() => handleLongPress(item)}
            />
          )}
          onScrollToIndexFailed={(info) => {
            if (scrollRetryRef.current) {
              clearTimeout(scrollRetryRef.current);
            }
            scrollRetryRef.current = setTimeout(() => {
              scrollRetryRef.current = null;
              if (activeIndexRef.current !== SCHEDULED_TAB_INDEX) return;
              listRef.current?.scrollToIndex({
                index: info.index,
                animated: false,
                viewPosition: 0.5,
              });
            }, 200);
          }}
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
