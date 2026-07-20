import React from 'react';
import { Text as RNText, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '../config/ThemeProvider';
import { typography, type TextVariant } from '../config/tokens';

export type AppTextProps = TextProps & {
  variant?: TextVariant;
  /** Override default ink color with a semantic tone. */
  tone?: 'ink' | 'body' | 'muted' | 'mutedSoft' | 'onInk';
};

const DEFAULT_TONE: Partial<Record<TextVariant, AppTextProps['tone']>> = {
  display: 'ink',
  title: 'ink',
  'title-sm': 'ink',
  body: 'ink',
  'body-sm': 'muted',
  'mono-meta': 'muted',
  caption: 'muted',
  micro: 'ink',
  button: 'ink',
};

export function Text({
  variant = 'body',
  tone,
  style,
  ...rest
}: AppTextProps) {
  const { colors } = useTheme();
  const resolvedTone = tone ?? DEFAULT_TONE[variant] ?? 'ink';

  const colorMap = {
    ink: colors.ink,
    body: colors.body,
    muted: colors.muted,
    mutedSoft: colors.mutedSoft,
    onInk: colors.onInk,
  } as const;

  const base: TextStyle = typography[variant];

  return (
    <RNText style={[base, { color: colorMap[resolvedTone] }, style]} {...rest} />
  );
}
