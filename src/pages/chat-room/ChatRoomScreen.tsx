import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Keyboard,
  type LayoutChangeEvent,
  type ViewToken,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  FadeIn,
  FadeOut,
  runOnJS,
} from 'react-native-reanimated';
import { FlatList, GestureDetector } from 'react-native-gesture-handler';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme, useLocale, spacing } from '../../shared/config';
import {
  useKeyboardHeight,
  KEYBOARD_ANDROID_LIFT_FUDGE,
  KEYBOARD_COMPOSER_GAP,
  MESSAGE_LIST_BOTTOM_GAP,
  PAGER_TAB_BAR_HEIGHT,
} from '../../shared/lib';
import { Text, AlertDialog, type AlertButton } from '../../shared/ui';
import { getChatById, type Chat } from '../../entities/chat';
import {
  getVisibleMessagesByChatId,
  deleteMessage,
  getMessageById,
  getPeriodicDisplayMessages,
  getScheduledMessagesByChatId,
  disableFiredMessages,
  isPeriodicDisplayId,
  extractTemplateId,
  type Message,
} from '../../entities/message';
import { cancelNotification } from '../../features/notifications';
import { syncScheduledWidgetSnapshot } from '../../features/scheduled-widget';
import { markChatAsRead } from '../../features/unread-badges';
import { useEditMessage, type EditFields } from '../../features/edit-message';
import {
  ImageViewer,
  useImageViewer,
  useFuturePeekEntryGesture,
  useFuturePeekExitGesture,
  FuturePeekOverlay,
} from '../../features';
import { ChatForm } from '../../widgets/chat-form';
import { MessageComposer } from '../../widgets/message-composer';
import type { ChatStackParamList } from '../../app/types';
import { navigateToScheduled } from '../../app/mainTabsApi';

import { ChatHeader } from './ChatHeader';
import { MessageLine } from './MessageLine';
import { MessageContextMenu } from './MessageContextMenu';
import { MessageEditor } from './MessageEditor';
import { DateSeparator } from './DateSeparator';
import { SearchOverlay } from './SearchOverlay';
import { FutureTimeline } from './FutureTimeline';
import { resolveTimelineMode, type TimelineMode } from './timelineMode';
import {
  canListScroll,
  isScrollAtBottom,
  isScrollAtTop,
  shouldAttachNativeScrollGesture,
  shouldStickToBottomOnLayoutShrink,
} from './scrollEdge';
import { resolveChatRoomBackAction } from './chatRoomBack';

type Nav = NativeStackNavigationProp<ChatStackParamList, 'ChatRoom'>;
type ChatRoomRoute = RouteProp<ChatStackParamList, 'ChatRoom'>;

type ListItem =
  | { kind: 'date'; key: string; date: string }
  | { kind: 'message'; key: string; message: Message };

const REFRESH_INTERVAL = 30_000;
const FUTURE_REFRESH_INTERVAL = 15_000;

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList as any,
) as any;

function wrapHistoryNativeScroll(
  canScroll: boolean,
  gesture: ReturnType<typeof useFuturePeekEntryGesture>['nativeGesture'],
  child: React.ReactElement,
): React.ReactElement {
  if (!shouldAttachNativeScrollGesture(canScroll)) return child;
  return <GestureDetector gesture={gesture}>{child}</GestureDetector>;
}

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
  const { chatId, messageId, focusNonce, mode } = route.params;
  const { colors } = useTheme();
  const { t } = useLocale();
  const insets = useSafeAreaInsets();
  const tabBarHeight = PAGER_TAB_BAR_HEIGHT + insets.bottom;

  const [chat, setChat] = useState<Chat | null | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [futureMessages, setFutureMessages] = useState<Message[]>([]);
  const [timelineMode, setTimelineMode] = useState<TimelineMode>(() =>
    resolveTimelineMode(mode),
  );
  const timelineModeRef = useRef<TimelineMode>(timelineMode);
  timelineModeRef.current = timelineMode;
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
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [atBottom, setAtBottom] = useState(true);
  const [atTop, setAtTop] = useState(true);
  const [historyCanScroll, setHistoryCanScroll] = useState(false);
  const [futureCanScroll, setFutureCanScroll] = useState(false);
  const {
    open,
    close,
    visible: viewerVisible,
    data: viewerData,
    openKey: viewerOpenKey,
  } = useImageViewer();

  const scrollY = useSharedValue(0);
  const flatListRef = useRef<FlatList>(null);
  const futureListRef = useRef<FlatList<Message>>(null);
  const scrollToMessageId = useRef(false);
  const scrolledToMessageRef = useRef<string | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyScrollOffsetRef = useRef(0);
  const suppressScrollToBottomRef = useRef(false);
  const listMetricsRef = useRef({ contentHeight: 0, layoutHeight: 0 });
  const keyboardHeight = useKeyboardHeight();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const futureTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateHistoryEdges = useCallback(
    (offsetY: number, contentHeight: number, layoutHeight: number) => {
      historyScrollOffsetRef.current = offsetY;
      listMetricsRef.current = { contentHeight, layoutHeight };
      const nextBottom = isScrollAtBottom(offsetY, contentHeight, layoutHeight);
      const nextTop = isScrollAtTop(offsetY);
      const nextCanScroll = canListScroll(contentHeight, layoutHeight);
      setAtBottom((prev) => (prev === nextBottom ? prev : nextBottom));
      setAtTop((prev) => (prev === nextTop ? prev : nextTop));
      setHistoryCanScroll((prev) => (prev === nextCanScroll ? prev : nextCanScroll));
    },
    [],
  );

  const updateFutureEdges = useCallback(
    (offsetY: number, contentHeight: number, layoutHeight: number) => {
      listMetricsRef.current = { contentHeight, layoutHeight };
      const nextBottom = isScrollAtBottom(offsetY, contentHeight, layoutHeight);
      const nextTop = isScrollAtTop(offsetY);
      const nextCanScroll = canListScroll(contentHeight, layoutHeight);
      setAtBottom((prev) => (prev === nextBottom ? prev : nextBottom));
      setAtTop((prev) => (prev === nextTop ? prev : nextTop));
      setFutureCanScroll((prev) => (prev === nextCanScroll ? prev : nextCanScroll));
    },
    [],
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      runOnJS(updateHistoryEdges)(
        event.contentOffset.y,
        event.contentSize.height,
        event.layoutMeasurement.height,
      );
    },
  });

  const chatAreaAnimatedStyle = useAnimatedStyle(() => ({
    paddingBottom:
      Platform.OS === 'android'
        ? Math.max(
            keyboardHeight.value -
              tabBarHeight +
              KEYBOARD_ANDROID_LIFT_FUDGE +
              KEYBOARD_COMPOSER_GAP,
            0,
          )
        : 0,
  }));

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

  useEffect(() => {
    if (mode === 'future') {
      timelineModeRef.current = 'future';
      setTimelineMode('future');
    }
  }, [mode, focusNonce]);

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

  useEffect(() => {
    Keyboard.dismiss();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      Keyboard.dismiss();
    });
    return unsubscribe;
  }, [navigation]);

  const listItems = useMemo(() => buildListItems(messages), [messages]);

  const enterFuture = useCallback(() => {
    historyScrollOffsetRef.current = scrollY.value;
    suppressScrollToBottomRef.current = true;
    Keyboard.dismiss();
    timelineModeRef.current = 'future';
    setTimelineMode('future');
    loadFuture();
    setAtTop(true);
  }, [loadFuture, scrollY]);

  const exitFuture = useCallback(() => {
    suppressScrollToBottomRef.current = true;
    timelineModeRef.current = 'history';
    setTimelineMode('history');
    if (mode === 'future') {
      navigation.setParams({ mode: 'history' });
    }
    const offset = historyScrollOffsetRef.current;
    requestAnimationFrame(() => {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset, animated: false });
        setTimeout(() => {
          suppressScrollToBottomRef.current = false;
        }, 100);
      }, 50);
    });
  }, [mode, navigation]);

  const handleBack = useCallback(() => {
    if (resolveChatRoomBackAction(timelineModeRef.current) === 'exit-future') {
      exitFuture();
      return;
    }
    navigation.goBack();
  }, [exitFuture, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (resolveChatRoomBackAction(timelineModeRef.current) !== 'exit-future') {
        return;
      }
      e.preventDefault();
      exitFuture();
    });
    return unsubscribe;
  }, [navigation, exitFuture]);

  const entryPeek = useFuturePeekEntryGesture({
    enabled: timelineMode === 'history' && !searchVisible,
    atBottom,
    onCommit: enterFuture,
  });

  const exitPeek = useFuturePeekExitGesture({
    enabled: timelineMode === 'future' && !searchVisible,
    atTop,
    onCommit: exitFuture,
  });

  const scrollToBottom = useCallback((animated = false) => {
    if (scrollToMessageId.current) return;
    if (suppressScrollToBottomRef.current) return;
    if (timelineMode !== 'history') return;
    flatListRef.current?.scrollToEnd({ animated });
  }, [timelineMode]);

  useEffect(() => {
    if (timelineMode !== 'history') return;
    if (listItems.length === 0) return;
    const timer = setTimeout(() => scrollToBottom(false), 50);
    return () => clearTimeout(timer);
  }, [listItems, scrollToBottom, timelineMode]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      // Keep peek armed while layout shrinks; then pin to end.
      setAtBottom(true);
      setTimeout(() => scrollToBottom(true), 100);
    });
    return () => showSub.remove();
  }, [scrollToBottom]);

  useEffect(() => {
    scrolledToMessageRef.current = null;
  }, [messageId, focusNonce]);

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
        highlightTimerRef.current = null;
      }
    };
  }, []);

  const pulseHighlight = useCallback((targetId: string) => {
    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current);
    }
    setHighlightedMessageId(targetId);
    highlightTimerRef.current = setTimeout(() => {
      setHighlightedMessageId(null);
      highlightTimerRef.current = null;
    }, 1000);
  }, []);

  useEffect(() => {
    if (timelineMode !== 'history') return;
    if (!messageId || listItems.length === 0) return;
    if (scrolledToMessageRef.current === messageId) return;

    let index = listItems.findIndex(
      (item) => item.kind === 'message' && item.message.id === messageId,
    );
    if (index === -1) {
      index = listItems.findIndex(
        (item) => item.kind === 'message' && item.message.id === `periodic:${messageId}`,
      );
    }
    if (index === -1) return;

    const targetListId = (listItems[index] as { message: Message }).message.id;
    scrolledToMessageRef.current = messageId;
    scrollToMessageId.current = true;
    pulseHighlight(targetListId);

    const timer = setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }, 200);
    return () => clearTimeout(timer);
  }, [messageId, focusNonce, listItems, timelineMode, pulseHighlight]);

  useEffect(() => {
    if (timelineMode !== 'future') return;
    if (!messageId || futureMessages.length === 0) return;
    if (scrolledToMessageRef.current === `future:${messageId}`) return;

    const index = futureMessages.findIndex((m) => m.id === messageId);
    if (index === -1) return;

    scrolledToMessageRef.current = `future:${messageId}`;
    pulseHighlight(messageId);

    const timer = setTimeout(() => {
      futureListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }, 200);
    return () => clearTimeout(timer);
  }, [messageId, focusNonce, futureMessages, timelineMode, pulseHighlight]);

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
      if (timelineMode === 'future') {
        setTimelineMode('history');
      }
      let targetId = msgId;
      if (!listItems.some((item) => item.kind === 'message' && item.message.id === msgId)) {
        targetId = `periodic:${msgId}`;
      }
      const index = listItems.findIndex(
        (item) => item.kind === 'message' && item.message.id === targetId,
      );
      if (index === -1) return;
      scrollToMessageId.current = true;
      pulseHighlight(targetId);

      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      }, 200);
    },
    [listItems, pulseHighlight, timelineMode],
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
            loadFuture();
          },
        },
      ],
    });
  }, [menuMessage, t, loadData, loadFuture]);

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
      loadFuture();
    },
    [editMessage, saveEdit, loadData, loadFuture],
  );

  const handleScheduleCta = useCallback(() => {
    exitFuture();
  }, [exitFuture]);

  const handleFutureMessagePress = useCallback((message: Message) => {
    navigateToScheduled(message.id);
  }, []);

  const handleFutureScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      updateFutureEdges(contentOffset.y, contentSize.height, layoutMeasurement.height);
    },
    [updateFutureEdges],
  );

  const renderListItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.kind === 'date') {
        return <DateSeparator date={item.date} />;
      }
      return (
        <MessageLine
          message={item.message}
          highlighted={item.message.id === highlightedMessageId}
          onLongPress={setMenuMessage}
          onImagePress={open}
        />
      );
    },
    [open, highlightedMessageId],
  );

  const keyExtractor = useCallback((item: ListItem) => item.key, []);

  if (chat === undefined) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.canvas }]}>
        <View style={{ height: insets.top }} />
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={colors.ink} />
        </View>
      </View>
    );
  }

  if (chat === null) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.canvas }]}>
        <View style={{ height: insets.top }} />
        <View style={styles.loadingCenter}>
          <Text variant="body-sm" tone="muted" style={{ textAlign: 'center' }}>
            {t.chatNotFound}
          </Text>
        </View>
      </View>
    );
  }

  const isFuture = timelineMode === 'future';

  return (
    <View style={[styles.root, { backgroundColor: colors.canvas }]}>
      <View style={styles.headerShell} onLayout={handleHeaderLayout}>
        <View style={{ height: insets.top, backgroundColor: colors.canvas }} />
        <ChatHeader
          chat={chat}
          onBack={handleBack}
          onTitlePress={() => setEditFormVisible(true)}
          onSearch={() => setSearchVisible(true)}
          modeLabel={isFuture ? t.futureMode : null}
        />
      </View>

      {searchVisible && (
        <SearchOverlay
          chatId={chatId}
          onClose={() => setSearchVisible(false)}
          onSelect={handleSearchSelect}
        />
      )}

      {isFuture && !searchVisible && (
        <Animated.View
          key="future-mode"
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={[
            styles.stickyDate,
            { top: headerAreaHeight, backgroundColor: colors.canvas },
          ]}>
          <View style={styles.futureChip}>
            <Text variant="mono-meta" tone="muted">
              {`── ${t.futureMode} ──`}
            </Text>
          </View>
        </Animated.View>
      )}

      {!isFuture && stickyDate && !searchVisible && (
        <Animated.View
          key={stickyDate}
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={[
            styles.stickyDate,
            { top: headerAreaHeight, backgroundColor: colors.canvas },
          ]}>
          <DateSeparator date={stickyDate} />
        </Animated.View>
      )}

      <Animated.View style={[styles.chatArea, chatAreaAnimatedStyle]}>
        {isFuture ? (
          <View style={styles.listContainer}>
            <GestureDetector gesture={exitPeek.gesture}>
              <Animated.View
                style={[styles.listPane, exitPeek.rubberBandStyle]}
                accessible
                accessibilityHint={t.futureExitA11y}
              >
                <FutureTimeline
                  ref={futureListRef}
                  messages={futureMessages}
                  highlightedMessageId={highlightedMessageId}
                  onSchedulePress={handleScheduleCta}
                  onPressMessage={handleFutureMessagePress}
                  onLongPressMessage={setMenuMessage}
                  onScroll={handleFutureScroll}
                  scrollEnabled={futureCanScroll}
                  nativeScrollGesture={
                    shouldAttachNativeScrollGesture(futureCanScroll)
                      ? exitPeek.nativeGesture
                      : undefined
                  }
                  onContentSizeChange={(w, h) => {
                    updateFutureEdges(0, h, listMetricsRef.current.layoutHeight || h);
                  }}
                  onLayout={(height) => {
                    listMetricsRef.current.layoutHeight = height;
                    updateFutureEdges(
                      0,
                      listMetricsRef.current.contentHeight || height,
                      height,
                    );
                  }}
                />
              </Animated.View>
            </GestureDetector>
            <FuturePeekOverlay
              direction="exit"
              animatedStyle={exitPeek.overlayStyle}
              accessibilityLabel={t.futureExitA11y}
            />
          </View>
        ) : (
          <View style={styles.listContainer}>
            <GestureDetector gesture={entryPeek.gesture}>
              <Animated.View
                style={[styles.listPane, entryPeek.rubberBandStyle]}
                accessible
                accessibilityHint={t.futurePeekA11y}
              >
                {wrapHistoryNativeScroll(
                  historyCanScroll,
                  entryPeek.nativeGesture,
                  <AnimatedFlatList
                    ref={flatListRef as any}
                    data={listItems}
                    renderItem={renderListItem}
                    keyExtractor={keyExtractor}
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    scrollEnabled={historyCanScroll}
                    onViewableItemsChanged={handleViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                    onContentSizeChange={(_w: number, h: number) => {
                      listMetricsRef.current.contentHeight = h;
                      updateHistoryEdges(
                        historyScrollOffsetRef.current,
                        h,
                        listMetricsRef.current.layoutHeight,
                      );
                    }}
                    onLayout={(e: LayoutChangeEvent) => {
                      const h = e.nativeEvent.layout.height;
                      const prevLayout = listMetricsRef.current.layoutHeight;
                      const wasAtBottom = isScrollAtBottom(
                        historyScrollOffsetRef.current,
                        listMetricsRef.current.contentHeight,
                        prevLayout || h,
                      );
                      listMetricsRef.current.layoutHeight = h;

                      if (
                        shouldStickToBottomOnLayoutShrink(wasAtBottom, prevLayout, h)
                      ) {
                        setAtBottom(true);
                        flatListRef.current?.scrollToEnd({ animated: false });
                        updateHistoryEdges(
                          Math.max(0, listMetricsRef.current.contentHeight - h),
                          listMetricsRef.current.contentHeight,
                          h,
                        );
                        return;
                      }

                      updateHistoryEdges(
                        historyScrollOffsetRef.current,
                        listMetricsRef.current.contentHeight,
                        h,
                      );
                    }}
                    onScrollToIndexFailed={(info: any) => {
                      setTimeout(() => {
                        flatListRef.current?.scrollToIndex({
                          index: info.index,
                          animated: false,
                          viewPosition: 0.5,
                        });
                      }, 200);
                    }}
                  />,
                )}
              </Animated.View>
            </GestureDetector>
            <FuturePeekOverlay
              direction="enter"
              animatedStyle={entryPeek.overlayStyle}
              accessibilityLabel={t.futurePeekA11y}
            />
          </View>
        )}

        {!isFuture && (
          <MessageComposer
            chatId={chatId}
            onSent={() => {
              loadData();
              loadFuture();
            }}
          />
        )}
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
        onSaved={() => {
          loadData();
          loadFuture();
        }}
        editChat={chat}
      />

      <AlertDialog
        visible={dialog !== null}
        title={dialog?.title}
        message={dialog?.message}
        buttons={dialog?.buttons}
        onClose={() => setDialog(null)}
      />

      <ImageViewer
        visible={viewerVisible}
        data={viewerData}
        openKey={viewerOpenKey}
        onClose={close}
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
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerShell: {
    zIndex: 30,
    elevation: 30,
  },
  stickyDate: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
  },
  futureChip: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.gutter,
  },
  chatArea: {
    flex: 1,
    overflow: 'hidden',
  },
  listContainer: {
    flex: 1,
  },
  listPane: {
    flex: 1,
    overflow: 'hidden',
  },

  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: MESSAGE_LIST_BOTTOM_GAP,
  },
});
