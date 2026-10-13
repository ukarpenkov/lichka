import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
import type { ChecklistItem } from '../../../entities/message';
import { useTheme } from '../../../shared/config';
import { Text } from '../../../shared/ui';
import { CheckboxEmpty, CheckboxChecked } from '../../../shared/ui/pixel';

type Props = {
  items: readonly ChecklistItem[];
  onToggle?: (itemId: string) => void;
  onLongPress?: () => void;
};

export function Checklist({ items, onToggle, onLongPress }: Props) {
  const { colors } = useTheme();
  return (
    <View>
      {items.map(item => {
        const Icon = item.checked ? CheckboxChecked : CheckboxEmpty;
        return (
          <Pressable
            key={item.id}
            testID={`checklist-item-${item.id}`}
            accessibilityRole="checkbox"
            accessibilityLabel={item.text}
            accessibilityState={{ checked: item.checked, disabled: !onToggle }}
            onPress={onToggle ? () => onToggle(item.id) : undefined}
            onLongPress={onLongPress}
            delayLongPress={300}
            style={styles.row}>
            <View style={styles.icon} accessible={false}>
              <Icon size={20} color={item.checked ? colors.muted : colors.ink} />
            </View>
            <Text
              variant="body"
              tone={item.checked ? 'muted' : 'body'}
              style={[styles.text, item.checked && styles.completed]}>
              {item.text}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, minHeight: 40, paddingVertical: 8 },
  icon: { width: 20, height: 20 },
  text: {
    flex: 1,
    lineHeight: 20,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  completed: { textDecorationLine: 'line-through' },
});
