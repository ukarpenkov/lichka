import React, { useState, useCallback, useEffect } from 'react';
import {
  Modal,
  View,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import {
  useSharedValue,
  runOnJS,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../shared/config';
import { Text } from '../../shared/ui';
import { DayRing, DAY_STEP, DAY_SEGMENTS, DAY_RING_INNER, DAY_RING_OUTER } from './DayRing';
import { MonthRing, MONTH_STEP, MONTH_SEGMENTS, MONTH_RING_INNER, MONTH_RING_OUTER } from './MonthRing';
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

  const dayRotation = useSharedValue(0);
  const monthRotation = useSharedValue(0);
  const activeRing = useSharedValue(-1); // -1=none, 0=month, 1=day
  const lastAngle = useSharedValue(0);

  const cx = RING_SIZE / 2;
  const cy = RING_SIZE / 2;

  const initRotations = useCallback(
    (d: number, m: number) => {
      dayRotation.value = -(d - 1) * DAY_STEP;
      monthRotation.value = -m * MONTH_STEP;
    },
    [dayRotation, monthRotation],
  );

  useEffect(() => {
    if (visible) {
      const d = value.getUTCDate();
      const m = value.getUTCMonth();
      setYear(value.getUTCFullYear());
      setMonth(m);
      setDay(d);
      setHour(value.getUTCHours());
      setMinute(value.getUTCMinutes());
      initRotations(d, m);
    }
  }, [visible, value, initRotations]);

  const handleYearChange = useCallback(
    (y: number) => {
      setYear(y);
      const max = daysInMonth(y, month + 1);
      if (day > max) setDay(max);
    },
    [month, day],
  );

  const handleDayFromRotation = useCallback(
    (rot: number) => {
      const norm = ((rot % 360) + 360) % 360;
      const idx = (DAY_SEGMENTS - (Math.round(norm / DAY_STEP) % DAY_SEGMENTS)) % DAY_SEGMENTS;
      const d = idx + 1;
      const max = daysInMonth(year, month + 1);
      const clamped = Math.min(d, max);
      setDay(clamped);
    },
    [year, month],
  );

  const handleMonthFromRotation = useCallback(
    (rot: number) => {
      const norm = ((rot % 360) + 360) % 360;
      const idx = (MONTH_SEGMENTS - (Math.round(norm / MONTH_STEP) % MONTH_SEGMENTS)) % MONTH_SEGMENTS;
      setMonth(idx);
      const max = daysInMonth(year, idx + 1);
      if (day > max) setDay(max);
    },
    [year, day],
  );

  const onGestureEnd = useCallback(
    (ring: number, rot: number) => {
      if (ring === 0) {
        handleMonthFromRotation(rot);
      } else {
        handleDayFromRotation(rot);
      }
    },
    [handleMonthFromRotation, handleDayFromRotation],
  );

  const ringGesture = Gesture.Manual()
    .onTouchesDown((e, manager) => {
      'worklet';
      const touch = e.changedTouches[0];
      const dist = Math.sqrt((touch.x - cx) ** 2 + (touch.y - cy) ** 2);
      if (dist >= DAY_RING_INNER && dist <= DAY_RING_OUTER) {
        activeRing.value = 1; // day ring
        lastAngle.value =
          (Math.atan2(touch.y - cy, touch.x - cx) * 180) / Math.PI + 90;
        manager.activate();
      } else if (dist >= MONTH_RING_INNER && dist <= MONTH_RING_OUTER) {
        activeRing.value = 0; // month ring
        lastAngle.value =
          (Math.atan2(touch.y - cy, touch.x - cx) * 180) / Math.PI + 90;
        manager.activate();
      } else {
        manager.fail();
      }
    })
    .onTouchesMove((e, manager) => {
      'worklet';
      if (activeRing.value === -1) return;
      const touch = e.changedTouches[0];
      const angle =
        (Math.atan2(touch.y - cy, touch.x - cx) * 180) / Math.PI + 90;
      let delta = angle - lastAngle.value;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      if (activeRing.value === 1) {
        dayRotation.value += delta;
      } else {
        monthRotation.value += delta;
      }
      lastAngle.value = angle;
    })
    .onTouchesUp((_e, manager) => {
      'worklet';
      if (activeRing.value === -1) return;
      const isDay = activeRing.value === 1;
      const step = isDay ? DAY_STEP : MONTH_STEP;
      const rot = isDay ? dayRotation : monthRotation;
      const snapped = Math.round(rot.value / step) * step;
      rot.value = withSpring(snapped, { damping: 20, stiffness: 200 });
      runOnJS(onGestureEnd)(isDay ? 1 : 0, snapped);
      activeRing.value = -1;
      manager.end();
    })
    .onTouchesCancelled((_e, manager) => {
      'worklet';
      activeRing.value = -1;
      manager.end();
    });

  const handleConfirm = useCallback(() => {
    const result = new Date(Date.UTC(year, month, day, hour, minute));
    onConfirm(result);
  }, [year, month, day, hour, minute, onConfirm]);

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  const dateStr = `${day}.${String(month + 1).padStart(2, '0')}.${year}  ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <Pressable style={styles.overlay} onPress={handleCancel}>
        <Pressable
          style={[styles.card, { backgroundColor: background }]}
          onPress={() => {}}
        >
          {/* Year picker row */}
          <View style={styles.yearRow}>
            <Text variant="body" style={{ color: `${text}66` }}>
              {dateStr}
            </Text>
            <YearPicker
              year={year}
              textColor={text}
              accentColor={ACCENT}
              onChange={handleYearChange}
            />
          </View>

          {/* Concentric rings */}
          <GestureDetector gesture={ringGesture}>
            <View style={[styles.ringArea, { width: RING_SIZE, height: RING_SIZE }]}>
              <DayRing
                rotation={dayRotation}
                textColor={text}
                accentColor={ACCENT}
                size={RING_SIZE}
              />
              <MonthRing
                rotation={monthRotation}
                textColor={text}
                accentColor={ACCENT}
                size={RING_SIZE}
              />
              {/* Center: vertical time scroller */}
              <View style={styles.timeCenter} pointerEvents="box-none">
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
          </GestureDetector>

          {/* Buttons */}
          <View style={styles.buttons}>
            <Pressable onPress={handleCancel} style={styles.btn}>
              <Text variant="body" style={{ color: `${text}99` }}>
                Отмена
              </Text>
            </Pressable>
            <Pressable onPress={handleConfirm} style={styles.btn}>
              <Text
                variant="body"
                style={{ color: ACCENT, fontWeight: '700' }}
              >
                Готово
              </Text>
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
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
