import React from 'react';
import { View, Text as RNText, StyleSheet } from 'react-native';

type BadgeProps = {
  count: number;
};

export function Badge({ count }: BadgeProps) {
  if (count <= 0) return null;

  const label = count > 99 ? '99+' : String(count);
  const isWide = label.length > 2;

  return (
    <View style={[styles.badge, isWide && styles.wide]}>
      <RNText style={styles.text}>{label}</RNText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#E53935',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wide: {
    paddingHorizontal: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 20,
  },
});
