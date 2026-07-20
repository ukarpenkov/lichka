import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../shared/ui';
import { useLocale, useTheme } from '../../shared/config';
import { CHAT_AVATAR_ICONS, PixelIcon } from '../../shared/ui/pixel';

type IconGridProps = {
  onSelect: (iconId: string) => void;
};

export function IconGrid({ onSelect }: IconGridProps) {
  const { t } = useLocale();
  const { text } = useTheme();

  return (
    <View style={styles.container}>
      <Text variant="body" style={styles.title}>
        {t.chooseIcon}
      </Text>
      <FlatList
        data={[...CHAT_AVATAR_ICONS]}
        numColumns={6}
        keyExtractor={(item) => item}
        style={styles.flatList}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.cell,
              { opacity: pressed ? 0.6 : 1, backgroundColor: text + '12' },
            ]}
            onPress={() => onSelect(item)}
            accessibilityRole="button"
            accessibilityLabel={item}>
            <PixelIcon name={item} color={text} size={28} />
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
  flatList: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  grid: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  cell: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
    borderRadius: 10,
  },
});
