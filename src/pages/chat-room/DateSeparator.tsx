import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../../shared/ui';
import { useTheme } from '../../shared/config';

type DateSeparatorProps = {
  date: string; // ISO string
};

function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();

  const isSameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  if (isSameDay) return 'Сегодня';

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();

  if (isYesterday) return 'Вчера';

  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ];

  const day = d.getDate();
  const month = months[d.getMonth()];

  if (d.getFullYear() === now.getFullYear()) {
    return `${day} ${month}`;
  }

  return `${day} ${month} ${d.getFullYear()}`;
}

export function DateSeparator({ date }: DateSeparatorProps) {
  const { text } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.line, { backgroundColor: text + '20' }]} />
      <Text variant="caption" style={[styles.label, { color: text + '70' }]}>
        {formatDateLabel(date)}
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
