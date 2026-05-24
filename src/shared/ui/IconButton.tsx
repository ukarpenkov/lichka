import React from 'react';
import { Pressable, Image, type ImageSourcePropType, StyleSheet } from 'react-native';
import { useTheme } from '../config';

export type IconButtonProps = {
  /** Image source for custom icon */
  source?: ImageSourcePropType;
  /** Icon element (e.g. from react-native-svg) */
  children?: React.ReactNode;
  size?: number;
  onPress?: () => void;
  disabled?: boolean;
};

export function IconButton({
  source,
  children,
  size = 24,
  onPress,
  disabled,
}: IconButtonProps) {
  const { text } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { opacity: disabled ? 0.4 : pressed ? 0.7 : 1 },
      ]}
      hitSlop={8}
    >
      {source ? (
        <Image
          source={source}
          style={{ width: size, height: size, tintColor: text }}
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
