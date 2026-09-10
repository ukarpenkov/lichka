import React from 'react';
import { ActivityIndicator, Pressable, View, StyleSheet, Platform, type ViewStyle } from 'react-native';
import { Text } from '../../shared/ui';
import type { PixelIconComponent } from '../../shared/ui/pixel';
import { useTheme, listRow } from '../../shared/config';
import { hapticTap } from '../../shared/lib';

export type SettingsRowProps = {
  label: string;
  icon?: PixelIconComponent;
  onPress?: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
};

export function SettingsRow({
  label,
  icon: Icon,
  onPress,
  children,
  disabled = false,
  loading = false,
}: SettingsRowProps) {
  const { colors } = useTheme();
  const isDisabled = !onPress || disabled || loading;
  const muted = disabled && !loading;
  const iconColor = muted ? colors.muted : colors.ink;

  const handlePress =
    onPress && !isDisabled
      ? () => {
          hapticTap();
          onPress();
        }
      : undefined;

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      android_ripple={
        Platform.OS === 'android' && !isDisabled ? { color: colors.surfaceSoft } : undefined
      }
      style={({ pressed }) => [
        styles.row,
        pressed && Platform.OS !== 'android' && !isDisabled
          ? { backgroundColor: colors.surfaceSoft }
          : null,
      ]}>
      <View style={styles.left}>
        {Icon && <Icon size={20} color={iconColor} style={styles.icon} />}
        <Text variant="body" tone={muted ? 'muted' : 'ink'}>
          {label}
        </Text>
      </View>
      {loading ? (
        <ActivityIndicator
          testID="settings-row-loader"
          size="small"
          color={colors.ink}
        />
      ) : children ? (
        <View style={styles.right}>{children}</View>
      ) : null}
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
