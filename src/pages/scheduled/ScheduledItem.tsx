import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Bell, AlarmClock, Repeat } from 'lucide-react-native';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';

import { Text, AnimatedPressable } from '../../shared/ui';
import { useTheme, useLocale } from '../../shared/config';
import type { Message, MessageType } from '../../entities/message';

export type ScheduledItemProps = {
  message: Message;
  chatTitle: string;
  onPress: () => void;
};

const TYPE_ICON: Record<Exclude<MessageType, 'simple'>, typeof Bell> = {
  reminder: Bell,
  alarm: AlarmClock,
  periodic: Repeat,
};

export function ScheduledItem({ message, chatTitle, onPress }: ScheduledItemProps) {
  const { text } = useTheme();
  const { t, locale } = useLocale();
  const Icon = TYPE_ICON[message.type as keyof typeof TYPE_ICON];
  const localeTag = locale === 'ru' ? 'ru-RU' : 'en-US';
  const timeText =
    message.type === 'periodic'
      ? t.everyNMin(message.intervalMinutes ?? 0)
      : message.scheduledAt
        ? (() => {
            const date = new Date(message.scheduledAt);
            const now = new Date();
            const isToday =
              date.getDate() === now.getDate() &&
              date.getMonth() === now.getMonth() &&
              date.getFullYear() === now.getFullYear();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const isTomorrow =
              date.getDate() === tomorrow.getDate() &&
              date.getMonth() === tomorrow.getMonth() &&
              date.getFullYear() === tomorrow.getFullYear();
            const time = date.toLocaleTimeString(localeTag, {
              hour: '2-digit',
              minute: '2-digit',
            });
            if (isToday) return time;
            if (isTomorrow) return `${t.tomorrow} ${time}`;
            return date.toLocaleDateString(localeTag, {
              day: 'numeric',
              month: 'short',
            }) + ` ${time}`;
          })()
        : '';

  return (
    <Animated.View
      entering={FadeInUp.springify().damping(20).stiffness(200)}
      layout={Layout.springify().damping(22).stiffness(180)}>
      <AnimatedPressable
        onPress={onPress}
        pressStyle={{ opacity: 0.7 }}
        style={[styles.row, { borderBottomColor: text + '15' }]}>
        <View style={styles.iconWrap}>
          {Icon && <Icon size={20} color={text} />}
        </View>
        <View style={styles.content}>
          <Text numberOfLines={1} style={styles.body}>
            {message.body}
          </Text>
          <View style={styles.meta}>
            <Text variant="caption" style={{ color: text + '99' }}>
              {chatTitle}
            </Text>
            <Text variant="caption" style={{ color: text + '60' }}>
              {timeText}
            </Text>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  body: {
    fontSize: 15,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
});
