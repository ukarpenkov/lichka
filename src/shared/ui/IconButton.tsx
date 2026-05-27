import React from 'react';
import { Pressable, Image, type ImageSourcePropType, StyleSheet } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '../config';

export type IconButtonProps = {
  /** Lucide icon component */
  icon?: LucideIcon;
  /** Image source for custom icon */
  source?: ImageSourcePropType;
  /** Icon element (e.g. from react-native-svg) */
  children?: React.ReactNode;
  size?: number;
  color?: string;
  onPress?: () => void;
  disabled?: boolean;
  /** Вызывается перед onPress — для haptic feedback */
  onPressIn?: () => void;
};

export function IconButton({
  icon: Icon,
  source,
  children,
  size = 24,
  color,
  onPress,
  disabled,
  onPressIn,
}: IconButtonProps) {
  const { text } = useTheme();
  const iconColor = color ?? text;

  const handlePress = () => {
    onPressIn?.();
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { opacity: disabled ? 0.4 : pressed ? 0.7 : 1 },
      ]}
      hitSlop={8}
    >
      {Icon ? (
        <Icon size={size} color={iconColor} />
      ) : source ? (
        <Image
          source={source}
          style={{ width: size, height: size, tintColor: iconColor }}
          resizeMode="contain"
        />
      ) : (
        children
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
});
