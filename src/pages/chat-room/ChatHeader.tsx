import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { ArrowLeft, Search } from 'lucide-react-native';
import { Text, Avatar, IconButton } from '../../shared/ui';
import { useTheme } from '../../shared/config';
import type { Chat } from '../../entities/chat';

type ChatHeaderProps = {
  chat: Chat;
  onBack: () => void;
  onTitlePress: () => void;
  onSearch: () => void;
};

export function ChatHeader({ chat, onBack, onTitlePress, onSearch }: ChatHeaderProps) {
  const { text, background } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: background, borderBottomColor: text + '20' }]}>
      <IconButton icon={ArrowLeft} size={24} onPress={onBack} />

      <Pressable style={styles.titleRow} onPress={onTitlePress}>
        <Avatar title={chat.title} avatarPath={chat.avatarPath} size={36} />
        <Text variant="body" style={styles.title} numberOfLines={1}>
          {chat.title}
        </Text>
      </Pressable>

      <IconButton icon={Search} size={22} onPress={onSearch} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
});
