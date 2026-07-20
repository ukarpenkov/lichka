import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Text } from '../../shared/ui';
import { useLocale, formatDateLabel, spacing } from '../../shared/config';

type DateSeparatorProps = {
  date: string;
};

/** Quiet day marker — caption only, no hairline rails. */
export function DateSeparator({ date }: DateSeparatorProps) {
  const { locale, t } = useLocale();

  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.container}>
      <Text variant="caption" tone="muted">
        {formatDateLabel(date, locale, t)}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.gutter,
  },
});
