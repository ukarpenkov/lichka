import React from 'react';
import {
  Pressable,
  type PressableProps,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../config';
import { Text } from './Text';

export type ButtonProps = Omit<PressableProps, 'style'> & {
  title: string;
  style?: PressableProps['style'];
};

export function Button({ title, disabled, style, ...rest }: ButtonProps) {
  const { text, background } = useTheme();

  const resolvedStyle = typeof style === 'function' ? undefined : style;
  const flatStyle = Array.isArray(resolvedStyle)
    ? Object.assign({}, ...resolvedStyle.filter(Boolean))
    : resolvedStyle;
  const bgColor = flatStyle?.backgroundColor;

  const labelColor = bgColor === text ? background : text;

  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { opacity: disabled ? 0.4 : pressed ? 0.7 : 1 },
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
      {...rest}
    >
      <Text variant="button" style={{ color: labelColor }}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
});
