import React from 'react';
import { Text as RNText, type TextProps, type TextStyle, StyleSheet } from 'react-native';
import { useTheme } from '../config';

export type AppTextProps = TextProps & {
  variant?: 'body' | 'caption';
};

export function Text({ variant = 'body', style, ...rest }: AppTextProps) {
  const { text } = useTheme();

  const base: TextStyle =
    variant === 'caption'
      ? { fontSize: 12, lineHeight: 16 }
      : { fontSize: 16, lineHeight: 24 };

  return <RNText style={[base, { color: text }, style]} {...rest} />;
}
