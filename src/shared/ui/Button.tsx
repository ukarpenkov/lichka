import React from 'react';
import {
  Pressable,
  type PressableProps,
  type TextStyle,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../config';
import { Text } from './Text';

export type ButtonProps = Omit<PressableProps, 'style'> & {
  title: string;
  style?: PressableProps['style'];
};

export function Button({ title, disabled, style, ...rest }: ButtonProps) {
  const { text } = useTheme();

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
      <Text style={{ color: text, fontSize: 16, fontWeight: '600' }}>{title}</Text>
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
