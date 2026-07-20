import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Text } from '../../shared/ui';
import { useLocale, formatDateLabel, spacing } from '../../shared/config';

type DateSeparatorProps = {
  date: string;
};

/** Textual day marker for terminal log — no hairline wings. */
export function DateSeparator({ date }: DateSeparatorProps) {
  const { locale, t } = useLocale();
  const label = formatDateLabel(date, locale, t);

  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.container}>
      <Text variant="mono-meta" tone="muted">
        {`── ${label} ──`}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.gutter,
  },
});
