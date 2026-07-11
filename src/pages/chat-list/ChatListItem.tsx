import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import { Text, SharedElementAvatar, AnimatedPressable, Badge } from '../../shared/ui';
import { useTheme } from '../../shared/config';
import type { Chat } from '../../entities/chat';

export type ChatListItemProps = {
  chat: Chat;
  unreadCount?: number;
  onPress: () => void;
  onLongPress: () => void;
};

export function ChatListItem({ chat, unreadCount = 0, onPress, onLongPress }: ChatListItemProps) {
  const { text } = useTheme();

  return (
    <Animated.View
      entering={FadeInUp.springify().damping(20).stiffness(200)}
      layout={Layout.springify().damping(22).stiffness(180)}>
      <AnimatedPressable
        onPress={onPress}
        onLongPress={onLongPress}
        pressStyle={{ opacity: 0.7 }}
        style={[styles.row, { borderBottomColor: text + '15' }]}>
        <View style={styles.avatarContainer}>
          <SharedElementAvatar sharedId={`avatar-${chat.id}`} title={chat.title} avatarPath={chat.avatarPath} />
        </View>
        <Text numberOfLines={1} style={styles.title}>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatarContainer: {
    position: 'relative',
  },
  title: {
    marginLeft: 12,
    flex: 1,
    fontSize: 16,
  },
  badge: {
    marginLeft: 8,
  },
});
