import React, { useState, useCallback, useEffect } from 'react';
import { Modal, View, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../shared/config';
import { Text } from '../../shared/ui';
import { DayRing } from './DayRing';
import { MonthRing } from './MonthRing';
import { TimeScroller } from './TimeScroller';
import { YearPicker } from './YearPicker';
import { daysInMonth } from './circularMath';

const ACCENT = '#4A9EFF';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RING_SIZE = Math.min(SCREEN_WIDTH - 48, 300);

type Props = {
  visible: boolean;
  value: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
};

export function DateTimePicker({ visible, value, onConfirm, onCancel }: Props) {
  const { text, background } = useTheme();

  const [year, setYear] = useState(value.getUTCFullYear());
  const [month, setMonth] = useState(value.getUTCMonth());
  const [day, setDay] = useState(value.getUTCDate());
  const [hour, setHour] = useState(value.getUTCHours());
  const [minute, setMinute] = useState(value.getUTCMinutes());

  useEffect(() => {
    if (visible) {
      setYear(value.getUTCFullYear());
      setMonth(value.getUTCMonth());
      setDay(value.getUTCDate());
      setHour(value.getUTCHours());
      setMinute(value.getUTCMinutes());
    }
  }, [visible, value]);

  const handleDaySelect = useCallback(
    (d: number) => {
      const max = daysInMonth(year, month + 1);
      setDay(Math.min(d, max));
    },
    [year, month],
  );

  const handleMonthSelect = useCallback(
    (m: number) => {
      setMonth(m);
      const max = daysInMonth(year, m + 1);
      if (day > max) setDay(max);
    },
    [year, day],
  );

  const handleYearChange = useCallback(
    (y: number) => {
      setYear(y);
      const max = daysInMonth(y, month + 1);
      if (day > max) setDay(max);
    },
    [month, day],
  );

  const handleConfirm = useCallback(() => {
    const result = new Date(Date.UTC(year, month, day, hour, minute));
    onConfirm(result);
  }, [year, month, day, hour, minute, onConfirm]);

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <Pressable style={styles.overlay} onPress={handleCancel}>
        <Pressable style={[styles.card, { backgroundColor: background }]} onPress={() => {}}>
          {/* Year picker — top right */}
          <View style={styles.yearRow}>
            <Text variant="body" style={{ color: `${text}66` }}>
              {day}.{String(month + 1).padStart(2, '0')}.{year} {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
            </Text>
            <YearPicker year={year} textColor={text} accentColor={ACCENT} onChange={handleYearChange} />
          </View>

          {/* Concentric rings */}
          <View style={[styles.ringArea, { width: RING_SIZE, height: RING_SIZE }]}>
            <DayRing
              selectedDay={day}
              textColor={text}
              accentColor={ACCENT}
              size={RING_SIZE}
              onSelect={handleDaySelect}
            />
            <MonthRing
              selectedMonth={month}
              textColor={text}
              accentColor={ACCENT}
              size={RING_SIZE}
              onSelect={handleMonthSelect}
            />
            {/* Center: time scroller */}
            <View style={styles.timeCenter}>
              <TimeScroller
                hour={hour}
                minute={minute}
                textColor={text}
                accentColor={ACCENT}
                onHourChange={setHour}
                onMinuteChange={setMinute}
              />
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            <Pressable onPress={handleCancel} style={styles.btn}>
              <Text variant="body" style={{ color: `${text}99` }}>Отмена</Text>
            </Pressable>
            <Pressable onPress={handleConfirm} style={styles.btn}>
              <Text variant="body" style={{ color: ACCENT, fontWeight: '700' }}>Готово</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  yearRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ringArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -80 }, { translateY: -20 }],
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    marginTop: 20,
    gap: 24,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
});
