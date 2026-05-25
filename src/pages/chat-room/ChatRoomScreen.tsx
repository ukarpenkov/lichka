import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, FlatList, Alert, StyleSheet, type ViewToken, type LayoutChangeEvent } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../shared/config';
import { getChatById, type Chat } from '../../entities/chat';
import {
  getVisibleMessagesByChatId,
  deleteMessage,
  type Message,
} from '../../entities/message';
import { ChatForm } from '../../widgets/chat-form';
import { MessageComposer } from '../../widgets/message-composer';
import type { ChatStackParamList } from '../../app/types';

import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { MessageContextMenu } from './MessageContextMenu';
import { DateSeparator } from './DateSeparator';
import { SearchOverlay } from './SearchOverlay';

type Nav = NativeStackNavigationProp<ChatStackParamList, 'ChatRoom'>;
type ChatRoomRoute = RouteProp<ChatStackParamList, 'ChatRoom'>;

type ListItem =
  | { kind: 'date'; key: string; date: string }
  | { kind: 'message'; key: string; message: Message };

function getDayKey(iso: string): string {
  return iso.slice(0, 10);
}

function buildListItems(messages: Message[]): ListItem[] {
  const items: ListItem[] = [];
  let prevDay = '';

  for (const msg of messages) {
    const day = getDayKey(msg.createdAt);
    if (day !== prevDay) {
      items.push({ kind: 'date', key: `date-${day}`, date: msg.createdAt });
      prevDay = day;
    }
    items.push({ kind: 'message', key: msg.id, message: msg });
  }

  return items;
}

export function ChatRoomScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ChatRoomRoute>();
  const { chatId } = route.params;
  const { text, background } = useTheme();
  const insets = useSafeAreaInsets();

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [menuMessage, setMenuMessage] = useState<Message | null>(null);
  const [editFormVisible, setEditFormVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stickyDate, setStickyDate] = useState<string | null>(null);
  const [headerAreaHeight, setHeaderAreaHeight] = useState(0);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const loadData = useCallback(() => {
    setChat(getChatById(chatId));
    setMessages(getVisibleMessagesByChatId(chatId));
  }, [chatId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const listItems = useMemo(() => buildListItems(messages), [messages]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return listItems;
    const q = searchQuery.toLowerCase();
    return listItems.filter((item) => {
      if (item.kind === 'date') return true;
      return item.message.body.toLowerCase().includes(q);
    });
  }, [listItems, searchQuery]);

  const highlightedIds = useMemo(() => {
    if (!searchQuery.trim()) return new Set<string>();
    const q = searchQuery.toLowerCase();
    return new Set(
      messages.filter((m) => m.body.toLowerCase().includes(q)).map((m) => m.id),
    );
  }, [messages, searchQuery]);

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      for (const v of viewableItems) {
        if (v.isViewable && v.item.kind === 'date') {
          setStickyDate((v.item as { date: string }).date);
          return;
        }
      }
    },
    [],
  );

  const handleHeaderLayout = useCallback((e: LayoutChangeEvent) => {
    setHeaderAreaHeight(e.nativeEvent.layout.height);
  }, []);

  const handleDeleteMessage = useCallback(() => {
    if (!menuMessage) return;
    Alert.alert('Удалить сообщение', 'Удалить без возможности восстановления?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => {
          deleteMessage(menuMessage.id);
          setMessages(getVisibleMessagesByChatId(chatId));
        },
      },
    ]);
  }, [menuMessage, chatId]);

  const handleEditMessage = useCallback(() => {
    // TODO: откроется форма редактирования сообщения
  }, []);

  const renderListItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.kind === 'date') {
        return <DateSeparator date={item.date} />;
      }
      return (
        <MessageBubble
          message={item.message}
          highlighted={highlightedIds.has(item.message.id)}
          onLongPress={setMenuMessage}
        />
      );
    },
    [highlightedIds],
  );

  const keyExtractor = useCallback((item: ListItem) => item.key, []);

  if (!chat) {
    return (
      <View style={[styles.empty, { backgroundColor: background }]}>
        <View style={{ height: insets.top }} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: background }]}>
      {/* Header area (safe area + header + search) — measured for sticky positioning */}
      <View onLayout={handleHeaderLayout}>
        <View style={{ height: insets.top, backgroundColor: background }} />
        <ChatHeader
          chat={chat}
          onBack={() => navigation.goBack()}
          onTitlePress={() => setEditFormVisible(true)}
          onSearch={() => setSearchVisible(true)}
        />
        {searchVisible && (
          <SearchOverlay
            query={searchQuery}
            onChangeQuery={setSearchQuery}
            onClose={() => {
              setSearchVisible(false);
              setSearchQuery('');
            }}
            resultCount={
              searchQuery.trim()
                ? messages.filter((m) =>
                    m.body.toLowerCase().includes(searchQuery.toLowerCase()),
                  ).length
                : 0
            }
          />
        )}
      </View>

      {/* Sticky date header */}
      {stickyDate && (
        <View
          style={[
            styles.stickyDate,
            { top: headerAreaHeight, backgroundColor: background },
          ]}>
          <DateSeparator date={stickyDate} />
        </View>
      )}

      {/* Message list */}
      <FlatList
        data={filteredItems}
        renderItem={renderListItem}
        keyExtractor={keyExtractor}
        inverted
        style={styles.list}
        contentContainerStyle={styles.listContent}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Message composer */}
      <MessageComposer chatId={chatId} onSent={loadData} />

      {/* Context menu */}
      <MessageContextMenu
        visible={menuMessage !== null}
        onEdit={handleEditMessage}
        onDelete={handleDeleteMessage}
        onClose={() => setMenuMessage(null)}
      />

      {/* Chat edit form */}
      <ChatForm
        visible={editFormVisible}
        onClose={() => setEditFormVisible(false)}
        onSaved={loadData}
        editChat={chat}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  empty: {
    flex: 1,
  },
  stickyDate: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 4,
  },
});
