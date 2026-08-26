import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import { useTheme, useLocale, typography, type TextVariant } from '../config';
import { openExternalUrl, parseMessageLinks } from '../lib/messageLinks';
import { Text, type AppTextProps } from './Text';
import { AlertDialog } from './AlertDialog';
import { Link } from './pixel';

export type LinkifiedTextProps = AppTextProps & {
  text: string;
  /** Defaults to the computed font size of `variant` / `style`. */
  iconSize?: number;
};

function resolveIconSize(
  variant: TextVariant,
  iconSize: number | undefined,
  style: StyleProp<TextStyle> | undefined,
): number {
  if (iconSize != null) return iconSize;
  const flat = StyleSheet.flatten(style);
  if (flat && typeof flat.fontSize === 'number') return flat.fontSize;
  const fromVariant = typography[variant].fontSize;
  return typeof fromVariant === 'number' ? fromVariant : 16;
}

export function LinkifiedText({
  text,
  iconSize,
  variant = 'body',
  tone,
  style,
  children,
  ...rest
}: LinkifiedTextProps) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const [failed, setFailed] = useState(false);
  const segments = useMemo(() => parseMessageLinks(text), [text]);
  const size = resolveIconSize(variant, iconSize, style);

  const resolvedTone =
    tone ??
    (variant === 'body-sm' || variant === 'mono-meta' || variant === 'caption'
      ? 'muted'
      : 'ink');
  const colorMap = {
    ink: colors.ink,
    body: colors.body,
    muted: colors.muted,
    mutedSoft: colors.mutedSoft,
    onInk: colors.onInk,
  } as const;
  const iconColor = colorMap[resolvedTone];

  const handlePress = useCallback(async (href: string) => {
    try {
      await openExternalUrl(href);
    } catch {
      setFailed(true);
    }
  }, []);

  return (
    <>
      <Text variant={variant} tone={tone} style={style} {...rest}>
        {segments.map((seg, i) =>
          seg.type === 'link' ? (
            <Text
              key={`l-${i}`}
              variant={variant}
              tone={tone}
              onPress={() => {
                void handlePress(seg.href);
              }}
              accessibilityRole="link"
              accessibilityHint={t.openLink}
              accessibilityLabel={`${seg.value}, ${t.openLink}`}
              suppressHighlighting={false}
              style={styles.link}>
              {seg.value}
              {'\u00A0'}
              <Link
                size={size}
                color={iconColor}
                style={{ width: size, height: size, pointerEvents: 'none' }}
              />
            </Text>
          ) : (
            <Text key={`t-${i}`} variant={variant} tone={tone}>
              {seg.value}
            </Text>
          ),
        )}
        {children}
      </Text>
      {failed ? (
        <AlertDialog
          visible
          title={t.error}
          message={t.linkOpenFailed}
          buttons={[{ text: t.done, onPress: () => setFailed(false) }]}
          onClose={() => setFailed(false)}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  link: {
    textDecorationLine: 'underline',
  },
});
