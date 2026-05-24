import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { Text, Avatar } from '../../shared/ui';
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
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.row,
        { opacity: pressed ? 0.7 : 1, borderBottomColor: text + '15' },
      ]}>
      <Avatar title={chat.title} avatarPath={chat.avatarPath} />
      <Text numberOfLines={1} style={styles.title}>
        {chat.title}
      </Text>
    </Pressable>
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
