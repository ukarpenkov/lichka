import React, { forwardRef, useCallback } from 'react';
import { FlatList, View, StyleSheet, Platform, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { Bell, Repeat, Image as ImageIcon, type PixelIconComponent } from '../../shared/ui/pixel';
import { AlarmClockIcon, Text, Button, AnimatedPressable } from '../../shared/ui';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';

import { useTheme, useLocale, listRow, radii, formatScheduledWhen, spacing } from '../../shared/config';
import { hapticLongPress, MESSAGE_LIST_BOTTOM_GAP } from '../../shared/lib';
import { getSettings } from '../../entities/settings';
import type { Message, MessageType } from '../../entities/message';

export type FutureTimelineProps = {
  messages: Message[];
  highlightedMessageId: string | null;
  onSchedulePress: () => void;
  onPressMessage: (message: Message) => void;
  onLongPressMessage: (message: Message) => void;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onContentSizeChange?: (w: number, h: number) => void;
  onLayout?: (height: number) => void;
};

const TYPE_ICON: Record<Exclude<MessageType, 'simple'>, PixelIconComponent> = {
  reminder: Bell,
  alarm: AlarmClockIcon,
  periodic: Repeat,
  image: ImageIcon,
};

function FutureMessageRow({
  message,
  highlighted,
  onPress,
  onLongPress,
}: {
  message: Message;
  highlighted: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const { colors } = useTheme();
  const { t, locale } = useLocale();
  const Icon =
    message.type === 'simple' ? null : TYPE_ICON[message.type as Exclude<MessageType, 'simple'>];
  const timeText = formatScheduledWhen(message, locale, t);

  const handleLongPress = () => {
    if (getSettings().hapticEnabled) {
      hapticLongPress();
    }
    onLongPress();
  };

  return (
    <Animated.View
      entering={FadeInUp.springify().damping(20).stiffness(200)}
      layout={Layout.springify().damping(22).stiffness(180)}>
      <AnimatedPressable
        onPress={onPress}
        onLongPress={handleLongPress}
        delayLongPress={300}
        scaleTo={1}
        pressStyle={{ backgroundColor: colors.surfaceSoft }}
        style={[styles.row, highlighted ? { backgroundColor: colors.surfaceSoft } : null]}
        {...(Platform.OS === 'android'
          ? { android_ripple: { color: colors.surfaceSoft } }
          : {})}>
        <View style={[styles.iconWrap, { backgroundColor: colors.surfaceStrong }]}>
          {Icon ? <Icon size={20} color={colors.ink} /> : null}
        </View>
        <View style={styles.content}>
          <Text variant="title-sm" numberOfLines={1}>
            {message.body}
          </Text>
          <Text variant="body-sm" tone="mutedSoft" style={styles.when}>
            {timeText}
          </Text>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

export const FutureTimeline = forwardRef<FlatList<Message>, FutureTimelineProps>(
  function FutureTimeline(
    {
      messages,
      highlightedMessageId,
      onSchedulePress,
      onPressMessage,
      onLongPressMessage,
      onScroll,
      onContentSizeChange,
      onLayout,
    },
    ref,
  ) {
    const { colors } = useTheme();
    const { t } = useLocale();

    const renderItem = useCallback(
      ({ item }: { item: Message }) => (
        <FutureMessageRow
          message={item}
          highlighted={item.id === highlightedMessageId}
          onPress={() => onPressMessage(item)}
          onLongPress={() => onLongPressMessage(item)}
        />
      ),
      [highlightedMessageId, onPressMessage, onLongPressMessage],
    );

    if (messages.length === 0) {
      return (
        <View
          style={styles.empty}
          onLayout={(e) => onLayout?.(e.nativeEvent.layout.height)}
          accessibilityLabel={t.futureEmptyTitle}
        >
          <Text variant="body-sm" tone="muted" style={styles.emptyTitle}>
            {t.futureEmptyTitle}
          </Text>
          <Button title={t.futureScheduleCta} onPress={onSchedulePress} testID="future-schedule-cta" />
        </View>
      );
    }

    return (
      <FlatList
        ref={ref}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={styles.listHeader} accessibilityElementsHidden>
            <Text variant="mono-meta" tone="muted">
              {`── ${t.futureMode} ──`}
            </Text>
          </View>
        }
        style={{ flex: 1, backgroundColor: colors.canvas }}
        contentContainerStyle={styles.listContent}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onContentSizeChange={onContentSizeChange}
        onLayout={(e) => onLayout?.(e.nativeEvent.layout.height)}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            (ref as React.RefObject<FlatList<Message>> | null)?.current?.scrollToIndex({
              index: info.index,
              animated: false,
              viewPosition: 0.5,
            });
          }, 200);
        }}
      />
    );
  },
);

const styles = StyleSheet.create({
  listContent: {
    paddingTop: 0,
    paddingBottom: MESSAGE_LIST_BOTTOM_GAP,
  },
  /** Matches sticky future chip / DateSeparator so rows sit below the overlay. */
  listHeader: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.gutter,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.gutter,
    gap: spacing.base,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: listRow.scheduled.paddingHorizontal,
    paddingVertical: listRow.scheduled.paddingVertical,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  when: {
    marginTop: 2,
  },
});
