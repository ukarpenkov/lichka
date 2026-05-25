import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from '../../shared/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

const MIN_YEAR = new Date().getFullYear() - 10;
const MAX_YEAR = new Date().getFullYear() + 10;

type Props = {
  year: number;
  textColor: string;
  accentColor: string;
  onChange: (year: number) => void;
};

export function YearPicker({ year, textColor, accentColor, onChange }: Props) {
  const canDec = year > MIN_YEAR;
  const canInc = year < MAX_YEAR;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => canDec && onChange(year - 1)}
        disabled={!canDec}
        hitSlop={8}
        style={styles.arrow}
      >
        <ChevronLeft size={20} color={canDec ? textColor : `${textColor}33`} />
      </Pressable>
      <Text variant="body" style={{ color: accentColor, fontWeight: '700', fontSize: 16, minWidth: 50, textAlign: 'center' }}>
        {year}
      </Text>
      <Pressable
        onPress={() => canInc && onChange(year + 1)}
        disabled={!canInc}
        hitSlop={8}
        style={styles.arrow}
      >
        <ChevronRight size={20} color={canInc ? textColor : `${textColor}33`} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    padding: 4,
  },
});
