import React from 'react';
import { Pressable, View, StyleSheet, Platform, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { Text } from '../../shared/ui';
import { useTheme, listRow } from '../../shared/config';

export type SettingsRowProps = {
  label: string;
  icon?: LucideIcon;
  onPress?: () => void;
  children?: React.ReactNode;
};

export function SettingsRow({ label, icon: Icon, onPress, children }: SettingsRowProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      android_ripple={
        Platform.OS === 'android' ? { color: colors.surfaceSoft } : undefined
      }
      style={({ pressed }) => [
        styles.row,
        pressed && Platform.OS !== 'android'
          ? { backgroundColor: colors.surfaceSoft }
          : null,
      ]}>
      <View style={styles.left}>
        {Icon && <Icon size={20} color={colors.ink} style={styles.icon} />}
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
    paddingVertical: listRow.settings.paddingVertical,
    paddingHorizontal: listRow.settings.paddingHorizontal,
    minHeight: listRow.settings.minHeight,
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
