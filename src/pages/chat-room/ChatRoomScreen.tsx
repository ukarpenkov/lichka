import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Platform, Keyboard, type LayoutChangeEvent, type ViewToken } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme, useLocale } from '../../shared/config';
import {
  useKeyboardHeight,
  KEYBOARD_ANDROID_LIFT_FUDGE,
  CHAT_LIST_KEYBOARD_BOTTOM_INSET,
  PAGER_TAB_BAR_HEIGHT,
} from '../../shared/lib';
import { Text, AlertDialog, type AlertButton } from '../../shared/ui';
import { getChatById, type Chat } from '../../entities/chat';
import {
  getVisibleMessagesByChatId,
  deleteMessage,
  getMessageById,
  getPeriodicDisplayMessages,
  isPeriodicDisplayId,
  extractTemplateId,
  type Message,
} from '../../entities/message';
import { cancelNotification } from '../../features/notifications';
import { markChatAsRead } from '../../features/unread-badges';
import { useEditMessage, type EditFields } from '../../features/edit-message';
import { ImageViewer, useImageViewer } from '../../features';
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

const REFRESH_INTERVAL = 30_000;

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList as any,
) as any;

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
  const { background, text } = useTheme();
  const { t } = useLocale();
  const insets = useSafeAreaInsets();
  const tabBarHeight = PAGER_TAB_BAR_HEIGHT;

  const [chat, setChat] = useState<Chat | null | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [menuMessage, setMenuMessage] = useState<Message | null>(null);
  const [editMessage, setEditMessage] = useState<Message | null>(null);
  const [editFormVisible, setEditFormVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [dialog, setDialog] = useState<{
    title?: string;
    message?: string;
    buttons?: AlertButton[];
  } | null>(null);
  const [stickyDate, setStickyDate] = useState<string | null>(null);
  const [headerAreaHeight, setHeaderAreaHeight] = useState(0);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const { open, close, visible: viewerVisible, data: viewerData } = useImageViewer();

  const scrollY = useSharedValue(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollToMessageId = useRef(false);
  const keyboardHeight = useKeyboardHeight();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Экран чата вложен в кастомный pager (SwipeablePager + PagerTabBar),
  // поэтому нижний tab bar уже занимает `tabBarHeight` над краем экрана —
  // вычитаем его из высоты клавиатуры.
  // На iOS клавиатуру поднимает система, ручная компенсация не нужна.
  const chatAreaAnimatedStyle = useAnimatedStyle(() => ({
    paddingBottom:
      Platform.OS === 'android'
        ? Math.max(
            keyboardHeight.value - tabBarHeight + KEYBOARD_ANDROID_LIFT_FUDGE,
            0,
          )
        : 0,
  }));

  const listContentPaddingBottom = keyboardOpen
    ? CHAT_LIST_KEYBOARD_BOTTOM_INSET
    : 4;

  const loadData = useCallback(() => {
    setChat(getChatById(chatId) ?? null);
    const regularMessages = getVisibleMessagesByChatId(chatId);
    const periodicMessages = getPeriodicDisplayMessages(chatId);
    const allMessages = [...regularMessages, ...periodicMessages].sort(
      (a, b) => a.createdAt.localeCompare(b.createdAt),
    );
    setMessages(allMessages);
  }, [chatId]);

  useFocusEffect(
    useCallback(() => {
      markChatAsRead(chatId);
      loadData();
      timerRef.current = setInterval(loadData, REFRESH_INTERVAL);
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }, [chatId, loadData]),
  );

  useEffect(() => {
    Keyboard.dismiss();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      Keyboard.dismiss();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardOpen(true);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardOpen(false);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleContentSizeChange = useCallback(() => {
    if (keyboardOpen && !scrollToMessageId.current) {
      flatListRef.current?.scrollToEnd({ animated: false });
    }
  }, [keyboardOpen]);

  const listItems = useMemo(() => buildListItems(messages), [messages]);

  useEffect(() => {
    if (listItems.length > 0 && !scrollToMessageId.current) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [listItems]);

  useEffect(() => {
    if (!messageId || listItems.length === 0) return;
    let index = listItems.findIndex(
      (item) => item.kind === 'message' && item.message.id === messageId,
    );
    if (index === -1) {
      index = listItems.findIndex(
        (item) => item.kind === 'message' && item.message.id === `periodic:${messageId}`,
      );
    }
    if (index === -1) return;
    scrollToMessageId.current = true;
    const timer = setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }, 200);
    return () => clearTimeout(timer);
  }, [messageId, listItems]);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

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
      let targetId = msgId;
      if (!listItems.some((item) => item.kind === 'message' && item.message.id === msgId)) {
        targetId = `periodic:${msgId}`;
      }
      const index = listItems.findIndex(
        (item) => item.kind === 'message' && item.message.id === targetId,
      );
      if (index === -1) return;
      scrollToMessageId.current = true;
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
    const actualId = isPeriodicDisplayId(menuMessage.id)
      ? extractTemplateId(menuMessage.id)
      : menuMessage.id;
    setDialog({
      title: t.deleteMessage,
      message: t.deleteMessageConfirm,
      buttons: [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.delete,
          style: 'destructive',
          onPress: () => {
            deleteMessage(actualId);
            cancelNotification(actualId);
            loadData();
          },
        },
      ],
    });
  }, [menuMessage, t, loadData]);

  const { saveEdit } = useEditMessage();

  const handleEditMessage = useCallback(() => {
    if (menuMessage) {
      if (isPeriodicDisplayId(menuMessage.id)) {
        const templateId = extractTemplateId(menuMessage.id);
        const template = getMessageById(templateId);
        if (template) {
          setEditMessage(template);
        }
      } else {
        setEditMessage(menuMessage);
      }
    }
  }, [menuMessage]);

  const handleSaveEdit = useCallback(
    (fields: EditFields) => {
      if (!editMessage) return;
      saveEdit(editMessage, fields);
      setEditMessage(null);
      loadData();
    },
    [editMessage, saveEdit, loadData],
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
          onImagePress={open}
        />
      );
    },
    [open],
  );

  const keyExtractor = useCallback((item: ListItem) => item.key, []);

  // undefined = ещё грузим, null = чат не найден
  if (chat === undefined) {
    return (
      <View style={[styles.empty, { backgroundColor: background }]}>
        <View style={{ height: insets.top }} />
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={text} />
        </View>
      </View>
    );
  }

  if (chat === null) {
    return (
      <View style={[styles.empty, { backgroundColor: background }]}>
        <View style={{ height: insets.top }} />
        <View style={styles.loadingCenter}>
          <Text variant="body" style={{ color: text + '80', textAlign: 'center' }}>
            {t.chatNotFound}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: background }]}>
      <View onLayout={handleHeaderLayout}>
        <View style={{ height: insets.top, backgroundColor: background }} />
        <ChatHeader
          chat={chat}
          onBack={() => navigation.goBack()}
          onTitlePress={() => setEditFormVisible(true)}
          onSearch={() => setSearchVisible(true)}
        />
      </View>

      {searchVisible && (
        <SearchOverlay
          chatId={chatId}
          onClose={() => setSearchVisible(false)}
          onSelect={handleSearchSelect}
        />
      )}

      {stickyDate && (
        <Animated.View
          key={stickyDate}
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={[
            styles.stickyDate,
            { top: headerAreaHeight, backgroundColor: background },
          ]}>
          <DateSeparator date={stickyDate} />
        </Animated.View>
      )}

      <Animated.View style={[styles.chatArea, chatAreaAnimatedStyle]}>
        <AnimatedFlatList
          ref={flatListRef as any}
          data={listItems}
          renderItem={renderListItem}
          keyExtractor={keyExtractor}
          style={styles.list}
          contentContainerStyle={[styles.listContent, { paddingBottom: listContentPaddingBottom }]}
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
          onContentSizeChange={handleContentSizeChange}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          bounces={!keyboardOpen}
          overScrollMode={keyboardOpen ? 'never' : 'auto'}
          onScrollToIndexFailed={(info: any) => {
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({
                index: info.index,
                animated: false,
                viewPosition: 0.5,
              });
            }, 200);
          }}
        />

        <MessageComposer chatId={chatId} onSent={loadData} />
      </Animated.View>

      <MessageContextMenu
        visible={menuMessage !== null}
        onEdit={handleEditMessage}
        onDelete={handleDeleteMessage}
        onClose={() => setMenuMessage(null)}
      />

      <MessageEditor
        visible={editMessage !== null}
        message={editMessage}
        onSave={handleSaveEdit}
        onClose={() => setEditMessage(null)}
      />

      <ChatForm
        visible={editFormVisible}
        onClose={() => setEditFormVisible(false)}
        onSaved={loadData}
        editChat={chat}
      />

      <AlertDialog
        visible={dialog !== null}
        title={dialog?.title}
        message={dialog?.message}
        buttons={dialog?.buttons}
        onClose={() => setDialog(null)}
      />

      <ImageViewer visible={viewerVisible} data={viewerData} onClose={close} />
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
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyDate: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
  },
  chatArea: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 4,
  },
});
