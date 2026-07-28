import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Bell, Repeat, Image as ImageIcon, type PixelIconComponent } from '../../shared/ui/pixel';
import { AlarmClockIcon } from '../../shared/ui';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';

import { Text, AnimatedPressable } from '../../shared/ui';
import { useTheme, useLocale, listRow, radii, formatScheduledWhen } from '../../shared/config';
import { hapticLongPress } from '../../shared/lib';
import { getSettings } from '../../entities/settings';
import type { Message, MessageType } from '../../entities/message';

export type ScheduledItemProps = {
  message: Message;
  chatTitle?: string;
  onPress: () => void;
  onLongPress: () => void;
  highlighted?: boolean;
};

const TYPE_ICON: Record<Exclude<MessageType, 'simple'>, PixelIconComponent> = {
  reminder: Bell,
  alarm: AlarmClockIcon,
  periodic: Repeat,
  image: ImageIcon,
};

export function ScheduledItem({
  message,
  chatTitle,
  onPress,
  onLongPress,
  highlighted = false,
}: ScheduledItemProps) {
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
        style={[
          styles.row,
          highlighted ? { backgroundColor: colors.surfaceSoft } : null,
        ]}
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
          <View style={styles.meta}>
            {chatTitle ? (
              <Text variant="body-sm" tone="muted" numberOfLines={1} style={styles.metaChat}>
                {chatTitle}
              </Text>
            ) : (
              <View style={styles.metaChat} />
            )}
            <Text variant="body-sm" tone="mutedSoft">
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
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    gap: 8,
  },
  metaChat: {
    flex: 1,
  },
});
