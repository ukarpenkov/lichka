import React from 'react';
import { Pressable, View, StyleSheet, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { Text } from '../../shared/ui';
import { useTheme } from '../../shared/config';

export type SettingsRowProps = {
  label: string;
  icon?: LucideIcon;
  onPress?: () => void;
  children?: React.ReactNode;
};

export function SettingsRow({ label, icon: Icon, onPress, children }: SettingsRowProps) {
  const { text } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        { opacity: pressed ? 0.6 : 1 },
      ]}>
      <View style={styles.left}>
        {Icon && <Icon size={20} color={text} style={styles.icon} />}
        <Text variant="body">{label}</Text>
      </View>
      {children && <View style={styles.right}>{children}</View>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  } satisfies ViewStyle,
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  } satisfies ViewStyle,
  icon: {
    marginRight: 12,
  },
  right: {
    marginLeft: 12,
  } satisfies ViewStyle,
});
