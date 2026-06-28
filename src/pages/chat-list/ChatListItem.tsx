import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import { Text, SharedElementAvatar, AnimatedPressable } from '../../shared/ui';
import { useTheme } from '../../shared/config';
import type { Chat } from '../../entities/chat';

export type ChatListItemProps = {
  chat: Chat;
  onPress: () => void;
  onLongPress: () => void;
};

export function ChatListItem({ chat, onPress, onLongPress }: ChatListItemProps) {
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
        <SharedElementAvatar sharedId={`avatar-${chat.id}`} title={chat.title} avatarPath={chat.avatarPath} />
        <Text numberOfLines={1} style={styles.title}>
          {chat.title}
        </Text>
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
  title: {
    marginLeft: 12,
    flex: 1,
    fontSize: 16,
  },
});
