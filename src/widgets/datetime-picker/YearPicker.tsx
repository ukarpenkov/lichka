import React, { useRef, useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from '../../shared/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

const MIN_YEAR = 2020;
const MAX_YEAR = 2035;

type Props = {
  year: number;
  textColor: string;
  accentColor: string;
  onChange: (year: number) => void;
  onLongPress?: () => void;
  onToday?: () => void;
};

export function YearPicker({
  year,
  textColor,
  accentColor,
  onChange,
  onLongPress,
  onToday,
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
            fontWeight: '700',
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

      {onToday && (
        <Pressable
          onPress={onToday}
          style={[styles.todayBtn, { backgroundColor: `${accentColor}14` }]}
        >
          <Text style={{ color: accentColor, fontSize: 11, fontWeight: '600' }}>
            Today
          </Text>
        </Pressable>
      )}
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
  todayBtn: {
    marginLeft: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
});
