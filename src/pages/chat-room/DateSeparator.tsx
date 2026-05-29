import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../../shared/ui';
import { useTheme, useLocale, formatDateLabel } from '../../shared/config';

type DateSeparatorProps = {
  date: string; // ISO string
};

export function DateSeparator({ date }: DateSeparatorProps) {
  const { text } = useTheme();
  const { locale, t } = useLocale();

  return (
    <View style={styles.container}>
      <View style={[styles.line, { backgroundColor: text + '20' }]} />
      <Text variant="caption" style={[styles.label, { color: text + '70' }]}>
        {formatDateLabel(date, locale, t)}
      </Text>
      <View style={[styles.line, { backgroundColor: text + '20' }]} />
    </View>
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
