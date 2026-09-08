import React from 'react';
import { Pressable, Image, type ImageSourcePropType, StyleSheet } from 'react-native';
import { useTheme } from '../config';
import { hapticTap } from '../lib/haptics';

export type IconButtonProps = {
  icon?: React.ComponentType<any>;
  source?: ImageSourcePropType;
  /** Icon element (e.g. from react-native-svg) */
  children?: React.ReactNode;
  size?: number;
  color?: string;
  onPress?: () => void;
  disabled?: boolean;
  /** Вызывается перед onPress — для haptic feedback */
  onPressIn?: () => void;
  /** Короткий impactLight при нажатии (навигация, открытие оверлея). */
  haptic?: boolean;
  testID?: string;
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
  haptic = false,
  testID,
}: IconButtonProps) {
  const { text } = useTheme();
  const iconColor = color ?? text;

  const handlePress = () => {
    if (haptic) {
      hapticTap();
    }
    onPressIn?.();
    onPress?.();
  };

  return (
    <Pressable
      testID={testID}
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
    // Android Material minimum 48dp; covers iOS 44pt comfortably.
    minWidth: 48,
    minHeight: 48,
    padding: 8,
  },
});
