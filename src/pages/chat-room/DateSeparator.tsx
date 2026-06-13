import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { Text } from '../../shared/ui';
import { useTheme, useLocale, formatDateLabel } from '../../shared/config';

type DateSeparatorProps = {
  date: string;
};

export function DateSeparator({ date }: DateSeparatorProps) {
  const { text } = useTheme();
  const { locale, t } = useLocale();

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={styles.container}>
      <Animated.View style={[styles.line, { backgroundColor: text + '20' }]} />
      <Text variant="caption" style={[styles.label, { color: text + '70' }]}>
        {formatDateLabel(date, locale, t)}
      </Text>
      <Animated.View style={[styles.line, { backgroundColor: text + '20' }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 10,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});
