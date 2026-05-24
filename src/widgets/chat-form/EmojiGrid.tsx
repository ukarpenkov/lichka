import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../shared/ui';
import { useTheme } from '../../shared/config';

const EMOJIS = [
  '😀', '😂', '🥰', '😎', '🤩', '😇',
  '🥳', '😤', '🤔', '😴', '🤗', '😈',
  '💀', '👻', '🤖', '👽', '💩', '🤡',
  '❤️', '🔥', '⭐', '🌈', '☀️', '🌙',
  '🎵', '🎮', '📚', '⚽', '🎭', '🍕',
];

type EmojiGridProps = {
  onSelect: (emoji: string) => void;
};

export function EmojiGrid({ onSelect }: EmojiGridProps) {
  const { text } = useTheme();

  return (
    <View style={styles.container}>
      <Text variant="body" style={styles.title}>
        Выберите эмодзи
      </Text>
      <FlatList
        data={EMOJIS}
        numColumns={6}
        keyExtractor={(item, i) => `${item}-${i}`}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.cell,
              { opacity: pressed ? 0.6 : 1 },
            ]}
            onPress={() => onSelect(item)}>
            <Text style={styles.emoji}>{item}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  grid: {
    alignItems: 'center',
  },
  cell: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
    borderRadius: 8,
  },
  emoji: {
    fontSize: 28,
  },
});
