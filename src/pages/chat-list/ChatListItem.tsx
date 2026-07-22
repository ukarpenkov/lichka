import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import { Text, AnimatedPressable, Badge } from '../../shared/ui';
import { ChatAvatar } from '../../widgets/chat-avatar';
import { useTheme, listRow } from '../../shared/config';
import type { Chat } from '../../entities/chat';

export type ChatListItemProps = {
  chat: Chat;
  unreadCount?: number;
  onPress: () => void;
  onLongPress: () => void;
};

export function ChatListItem({ chat, unreadCount = 0, onPress, onLongPress }: ChatListItemProps) {
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={FadeInUp.springify().damping(20).stiffness(200)}
      layout={Layout.springify().damping(22).stiffness(180)}>
      <AnimatedPressable
        onPress={onPress}
        onLongPress={onLongPress}
        scaleTo={1}
        pressStyle={{ backgroundColor: colors.surfaceSoft }}
        style={styles.row}
        {...(Platform.OS === 'android'
          ? { android_ripple: { color: colors.surfaceSoft } }
          : {})}>
        <View style={styles.avatarContainer}>
          <ChatAvatar title={chat.title} avatarPath={chat.avatarPath} />
        </View>
        <Text variant="title-sm" numberOfLines={1} style={styles.title}>
          {chat.title}
        </Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Badge count={unreadCount} />
          </View>
        )}
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: listRow.chat.paddingHorizontal,
    paddingVertical: listRow.chat.paddingVertical,
  },
  avatarContainer: {
    position: 'relative',
  },
  title: {
    marginLeft: 12,
    flex: 1,
  },
  badge: {
    marginLeft: 8,
  },
});
