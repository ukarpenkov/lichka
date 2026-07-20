import React from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { ArrowLeft, Search } from 'lucide-react-native';
import { Text, SharedElementAvatar, IconButton } from '../../shared/ui';
import { useTheme, spacing } from '../../shared/config';
import type { Chat } from '../../entities/chat';

type ChatHeaderProps = {
  chat: Chat;
  onBack: () => void;
  onTitlePress: () => void;
  onSearch: () => void;
};

/** In-chat header: back + avatar/title + search. Same quiet chrome as PageHeader — no hairline. */
export function ChatHeader({ chat, onBack, onTitlePress, onSearch }: ChatHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      <IconButton icon={ArrowLeft} size={24} onPress={onBack} />

      <Pressable
        style={({ pressed }) => [
          styles.titleRow,
          pressed && Platform.OS !== 'android'
            ? { backgroundColor: colors.surfaceSoft }
            : null,
        ]}
        android_ripple={
          Platform.OS === 'android' ? { color: colors.surfaceSoft } : undefined
        }
        onPress={onTitlePress}>
        <SharedElementAvatar
          sharedId={`avatar-${chat.id}`}
          title={chat.title}
          avatarPath={chat.avatarPath}
          size={36}
        />
        <Text variant="title" numberOfLines={1} style={styles.title}>
          {chat.title}
        </Text>
      </Pressable>

      <IconButton icon={Search} size={24} onPress={onSearch} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: spacing.xs,
    gap: 4,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 4,
  },
  title: {
    flex: 1,
    flexShrink: 1,
  },
});
