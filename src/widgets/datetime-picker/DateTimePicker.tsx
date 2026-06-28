import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  Modal,
  View,
  Pressable,
  StyleSheet,
  Dimensions,
  AccessibilityInfo,
} from 'react-native';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme, useLocale, getMonthLabels, getFullMonthNames } from '../../shared/config';
import { Text } from '../../shared/ui';
import { hapticTap } from '../../shared/lib';
import { getSettings } from '../../entities/settings';
import { Bezel } from './Bezel';
import { TimeScroller } from './TimeScroller';
import { YearPicker } from './YearPicker';
import { makeGeometry } from './geometry';
import { daysInMonth } from './circularMath';

const ACCENT = '#4A9EFF';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RING_SIZE = Math.min(SCREEN_WIDTH - 40, 312);
const GEO = makeGeometry(RING_SIZE);
const MONTH_COUNT = 12;
const MONTH_STEP = 360 / MONTH_COUNT;

const RING_DAY = 1;
const RING_MONTH = 0;
const RING_NONE = -1;

type Props = {
  visible: boolean;
  value: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
};

function dayStep(count: number): number {
  'worklet';
  return 360 / count;
}

export function DateTimePicker({ visible, value, onConfirm, onCancel }: Props) {
  const { text, background } = useTheme();
  const { t, locale } = useLocale();

  const monthShort = useMemo(() => getMonthLabels(locale), [locale]);
  const monthFull = useMemo(() => getFullMonthNames(locale), [locale]);

  const [year, setYear] = useState(value.getFullYear());
  const [month, setMonth] = useState(value.getMonth());
  const [day, setDay] = useState(value.getDate());
  const [hour, setHour] = useState(value.getHours());
  const [minute, setMinute] = useState(value.getMinutes());
  const [interacting, setInteracting] = useState<'day' | 'month' | null>(null);

  const dayCount = daysInMonth(year, month + 1);
  const dayLabels = useMemo(
    () => Array.from({ length: dayCount }, (_, i) => `${i + 1}`),
    [dayCount],
  );

  const dayRotation = useSharedValue(0);
  const monthRotation = useSharedValue(0);
  const activeRing = useSharedValue(RING_NONE);
  const lastAngle = useSharedValue(0);
  const lastDayIdx = useSharedValue(0);
  const lastMonthIdx = useSharedValue(0);
  const dayCountSV = useSharedValue(dayCount);

  const reduceMotionRef = useRef(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      reduceMotionRef.current = v;
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v) => {
      reduceMotionRef.current = v;
    });
    return () => sub.remove();
  }, []);

  const triggerHaptic = useCallback(() => {
    if (reduceMotionRef.current) return;
    if (!getSettings().hapticEnabled) return;
    hapticTap();
  }, []);

  const cx = GEO.cx;

  // Инициализация поворотов из value при открытии
  useEffect(() => {
    if (!visible) return;
    const d = value.getDate();
    const m = value.getMonth();
    const y = value.getFullYear();
    const count = daysInMonth(y, m + 1);
    setYear(y);
    setMonth(m);
    setDay(d);
    setHour(value.getHours());
    setMinute(value.getMinutes());
    setInteracting(null);
    dayCountSV.value = count;
    dayRotation.value = -(d - 1) * dayStep(count);
    monthRotation.value = -m * MONTH_STEP;
  }, [visible, value, dayRotation, monthRotation, dayCountSV]);

  // Пересчёт поворота дней при смене месяца/года (число дней меняется)
  useEffect(() => {
    dayCountSV.value = dayCount;
    const clamped = Math.min(day, dayCount);
    if (clamped !== day) setDay(clamped);
    const target = -(clamped - 1) * dayStep(dayCount);
    dayRotation.value = withSpring(target, { damping: 22, stiffness: 220 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayCount]);

  const handleYearChange = useCallback(
    (y: number) => {
      setYear(y);
    },
    [],
  );

  const onStepDay = useCallback(
    (idx: number) => {
      triggerHaptic();
      setDay(Math.min(idx + 1, dayCount));
    },
    [triggerHaptic, dayCount],
  );

  const onStepMonth = useCallback(
    (idx: number) => {
      triggerHaptic();
      setMonth(idx);
    },
    [triggerHaptic],
  );

  const setInteractingJS = useCallback((v: 'day' | 'month' | null) => {
    setInteracting(v);
  }, []);

  const onGestureEnd = useCallback(
    (ring: number, idx: number) => {
      if (ring === RING_DAY) {
        setDay(Math.min(idx + 1, dayCount));
      } else {
        setMonth(idx);
      }
      setInteracting(null);
    },
    [dayCount],
  );

  const ringGesture = Gesture.Manual()
    .onTouchesDown((e, manager) => {
      'worklet';
      const touch = e.changedTouches[0];
      const dist = Math.sqrt((touch.x - cx) ** 2 + (touch.y - cx) ** 2);

      if (dist < GEO.day.inner) {
        // Центр — скролл времени, кольца не активируем
        manager.fail();
        return;
      }

      const midband = (GEO.day.outer + GEO.month.inner) / 2;
      const isDay = dist <= midband;
      activeRing.value = isDay ? RING_DAY : RING_MONTH;
      lastAngle.value =
        (Math.atan2(touch.y - cx, touch.x - cx) * 180) / Math.PI + 90;

      const step = isDay ? dayStep(dayCountSV.value) : MONTH_STEP;
      const count = isDay ? dayCountSV.value : MONTH_COUNT;
      const rot = isDay ? dayRotation.value : monthRotation.value;
      const idx = ((Math.round(-rot / step) % count) + count) % count;
      if (isDay) lastDayIdx.value = idx;
      else lastMonthIdx.value = idx;

      runOnJS(setInteractingJS)(isDay ? 'day' : 'month');
      manager.activate();
    })
    .onTouchesMove((e) => {
      'worklet';
      if (activeRing.value === RING_NONE) return;
      const touch = e.changedTouches[0];
      const angle =
        (Math.atan2(touch.y - cx, touch.x - cx) * 180) / Math.PI + 90;
      let delta = angle - lastAngle.value;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      lastAngle.value = angle;

      const isDay = activeRing.value === RING_DAY;
      if (isDay) {
        dayRotation.value += delta;
      } else {
        monthRotation.value += delta;
      }

      const step = isDay ? dayStep(dayCountSV.value) : MONTH_STEP;
      const count = isDay ? dayCountSV.value : MONTH_COUNT;
      const rot = isDay ? dayRotation.value : monthRotation.value;
      const idx = ((Math.round(-rot / step) % count) + count) % count;

      if (isDay) {
        if (idx !== lastDayIdx.value) {
          lastDayIdx.value = idx;
          runOnJS(onStepDay)(idx);
        }
      } else if (idx !== lastMonthIdx.value) {
        lastMonthIdx.value = idx;
        runOnJS(onStepMonth)(idx);
      }
    })
    .onTouchesUp((_e, manager) => {
      'worklet';
      if (activeRing.value === RING_NONE) {
        manager.end();
        return;
      }
      const isDay = activeRing.value === RING_DAY;
      const step = isDay ? dayStep(dayCountSV.value) : MONTH_STEP;
      const count = isDay ? dayCountSV.value : MONTH_COUNT;
      const rot = isDay ? dayRotation : monthRotation;
      const snapped = Math.round(rot.value / step) * step;
      rot.value = withSpring(snapped, { damping: 22, stiffness: 220 });
      const idx = ((Math.round(-snapped / step) % count) + count) % count;
      runOnJS(onGestureEnd)(isDay ? RING_DAY : RING_MONTH, idx);
      activeRing.value = RING_NONE;
      manager.end();
    })
    .onTouchesCancelled((_e, manager) => {
      'worklet';
      activeRing.value = RING_NONE;
      runOnJS(setInteractingJS)(null);
      manager.end();
    });

  const handleConfirm = useCallback(() => {
    onConfirm(new Date(year, month, day, hour, minute));
  }, [year, month, day, hour, minute, onConfirm]);

  // Анимация заголовка: при работе с месяцами день плавно сдвигается вверх
  const headerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withTiming(interacting === 'month' ? -12 : 0, {
          duration: 250,
        }),
      },
    ],
  }));

  // Затемнение дня при выборе месяца
  const dayTextStyle = useAnimatedStyle(() => ({
    opacity: withTiming(interacting === 'month' ? 0.45 : 1, { duration: 250 }),
  }));

  const dayActive = interacting === 'day';
  const monthActive = interacting === 'month';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <GestureHandlerRootView style={styles.root}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable
          style={[styles.card, { backgroundColor: background }]}
          onPress={() => {}}
        >
          {/* Заголовок: год → месяц → крупный день (по центру) */}
          <Animated.View style={[styles.header, headerStyle]}>
            <YearPicker
              year={year}
              textColor={text}
              accentColor={ACCENT}
              onChange={handleYearChange}
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: monthActive ? ACCENT : `${text}99`,
                marginTop: 2,
              }}
            >
              {monthFull[month]}
            </Text>
            <Animated.Text
              style={[
                {
                  fontSize: 34,
                  fontWeight: '800',
                  color: dayActive ? ACCENT : text,
                  lineHeight: 40,
                },
                dayTextStyle,
              ]}
            >
              {day}
            </Animated.Text>
          </Animated.View>

          {/* Кольца */}
          <View style={[styles.ringArea, { width: RING_SIZE, height: RING_SIZE }]}>
            {/* Маркер слота выбора (12 часов) */}
            <View
              style={[styles.marker, { borderTopColor: ACCENT }]}
              pointerEvents="none"
            />

            <GestureDetector gesture={ringGesture}>
              <View style={StyleSheet.absoluteFill}>
                <Bezel
                  count={MONTH_COUNT}
                  labels={monthShort}
                  rotation={monthRotation}
                  center={GEO.month.center}
                  width={GEO.month.width}
                  size={RING_SIZE}
                  textColor={text}
                  accentColor={ACCENT}
                  fontSize={11}
                />
                <Bezel
                  count={dayCount}
                  labels={dayLabels}
                  rotation={dayRotation}
                  center={GEO.day.center}
                  width={GEO.day.width}
                  size={RING_SIZE}
                  textColor={text}
                  accentColor={ACCENT}
                  fontSize={11}
                />
              </View>
            </GestureDetector>

            {/* Центр: скролл времени вне жеста колец, чтобы не съезжала вёрстка */}
            <View style={styles.timeCenter} pointerEvents="box-none">
              <View
                style={[
                  styles.timeScrollerClip,
                  {
                    width: GEO.centerRadius * 2,
                    height: GEO.centerRadius * 2,
                    borderRadius: GEO.centerRadius,
                  },
                ]}
              >
                <TimeScroller
                  hour={hour}
                  minute={minute}
                  textColor={text}
                  accentColor={ACCENT}
                  onHourChange={setHour}
                  onMinuteChange={setMinute}
                  onTick={triggerHaptic}
                />
              </View>
            </View>
          </View>

          {/* Кнопки */}
          <View style={styles.buttons}>
            <Pressable onPress={onCancel} style={styles.btn}>
              <Text variant="body" style={{ color: `${text}99` }}>
                {t.cancel}
              </Text>
            </Pressable>
            <Pressable onPress={handleConfirm} style={[styles.btn, styles.doneBtn]}>
              <Text variant="body" style={{ color: '#FFFFFF', fontWeight: '700' }}>
                {t.done}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '92%',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  ringArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    position: 'absolute',
    top: 1,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    zIndex: 6,
  },
  timeCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  timeScrollerClip: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    marginTop: 16,
    gap: 16,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  doneBtn: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingHorizontal: 24,
  },
});
