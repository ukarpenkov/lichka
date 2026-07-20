import React, { useRef, useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from '../../shared/ui';
import { ChevronLeft, ChevronRight } from '../../shared/ui/pixel';
import { monoWeight } from '../../shared/config';

export const MIN_YEAR = 2020;
export const MAX_YEAR = 2035;

type Props = {
  year: number;
  textColor: string;
  accentColor: string;
  onChange: (year: number) => void;
  onLongPress?: () => void;
};

export function YearPicker({
  year,
  textColor,
  accentColor,
  onChange,
  onLongPress,
}: Props) {
  const canDec = year > MIN_YEAR;
  const canInc = year < MAX_YEAR;
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePressIn = useCallback(() => {
    if (onLongPress) {
      pressTimer.current = setTimeout(onLongPress, 500);
    }
  }, [onLongPress]);

  const handlePressOut = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }, []);

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

      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Text
          variant="body"
          style={{
            color: accentColor,
            ...monoWeight('bold'),
            fontSize: 16,
            minWidth: 56,
            textAlign: 'center',
          }}
        >
          {year}
        </Text>
      </Pressable>

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
