import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { cancelNotification } from '../../features/notifications';
import { useEditMessage, type EditFields } from '../../features/edit-message';
import { ChatForm } from '../../widgets/chat-form';
import { MessageComposer } from '../../widgets/message-composer';
import type { ChatStackParamList } from '../../app/types';

import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { MessageContextMenu } from './MessageContextMenu';
import { MessageEditor } from './MessageEditor';
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
  const { chatId, messageId } = route.params;
  const { background } = useTheme();
  const insets = useSafeAreaInsets();

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [menuMessage, setMenuMessage] = useState<Message | null>(null);
  const [editMessage, setEditMessage] = useState<Message | null>(null);
  const [editFormVisible, setEditFormVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [stickyDate, setStickyDate] = useState<string | null>(null);
  const [headerAreaHeight, setHeaderAreaHeight] = useState(0);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;
  const flatListRef = useRef<FlatList>(null);

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

  useEffect(() => {
    if (!messageId || listItems.length === 0) return;
    const index = listItems.findIndex(
      (item) => item.kind === 'message' && item.message.id === messageId,
    );
    if (index === -1) return;
    const timer = setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }, 200);
    return () => clearTimeout(timer);
  }, [messageId, listItems]);

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

  const handleSearchSelect = useCallback(
    (msgId: string) => {
      const index = listItems.findIndex(
        (item) => item.kind === 'message' && item.message.id === msgId,
      );
      if (index === -1) return;
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      }, 200);
    },
    [listItems],
  );

  const handleDeleteMessage = useCallback(() => {
    if (!menuMessage) return;
    Alert.alert('Удалить сообщение', 'Удалить без возможности восстановления?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => {
          deleteMessage(menuMessage.id);
          cancelNotification(menuMessage.id);
          setMessages(getVisibleMessagesByChatId(chatId));
        },
      },
    ]);
  }, [menuMessage, chatId]);

  const { saveEdit } = useEditMessage();

  const handleEditMessage = useCallback(() => {
    if (menuMessage) {
      setEditMessage(menuMessage);
    }
  }, [menuMessage]);

  const handleSaveEdit = useCallback(
    (fields: EditFields) => {
      if (!editMessage) return;
      saveEdit(editMessage, fields);
      setEditMessage(null);
      setMessages(getVisibleMessagesByChatId(chatId));
    },
    [editMessage, saveEdit, chatId],
  );

  const renderListItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.kind === 'date') {
        return <DateSeparator date={item.date} />;
      }
      return (
        <MessageBubble
          message={item.message}
          onLongPress={setMenuMessage}
        />
      );
    },
    [],
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
      </View>

      {/* Search overlay */}
      {searchVisible && (
        <SearchOverlay
          chatId={chatId}
          onClose={() => setSearchVisible(false)}
          onSelect={handleSearchSelect}
        />
      )}

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
        ref={flatListRef}
        data={listItems}
        renderItem={renderListItem}
        keyExtractor={keyExtractor}
        inverted
        style={styles.list}
        contentContainerStyle={styles.listContent}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: false,
              viewPosition: 0.5,
            });
          }, 200);
        }}
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

      {/* Message editor */}
      <MessageEditor
        visible={editMessage !== null}
        message={editMessage}
        onSave={handleSaveEdit}
        onClose={() => setEditMessage(null)}
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
