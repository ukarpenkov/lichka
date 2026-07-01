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
import { YearGridModal } from './YearGridModal';
import { makeGeometry } from './geometry';
import { daysInMonth } from './circularMath';
import Svg, { Circle } from 'react-native-svg';

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

  const savedValue = useRef<Date>(value);
  const reduceMotionRef = useRef(false);

  const [year, setYear] = useState(value.getFullYear());
  const [month, setMonth] = useState(value.getMonth());
  const [day, setDay] = useState(value.getDate());
  const [hour, setHour] = useState(value.getHours());
  const [minute, setMinute] = useState(value.getMinutes());
  const [interacting, setInteracting] = useState<'day' | 'month' | null>(null);
  const [yearModalVisible, setYearModalVisible] = useState(false);

  const dayCount = daysInMonth(year, month + 1);
  const allDayLabels = useMemo(
    () => Array.from({ length: 31 }, (_, i) => `${i + 1}`),
    [],
  );

  const dimDayIndices = useMemo(() => {
    const set = new Set<number>();
    for (let i = dayCount; i < 31; i++) set.add(i);
    return set;
  }, [dayCount]);

  const dayRotation = useSharedValue(0);
  const monthRotation = useSharedValue(0);
  const activeRing = useSharedValue(RING_NONE);
  const lastAngle = useSharedValue(0);
  const lastDayIdx = useSharedValue(0);
  const lastMonthIdx = useSharedValue(0);
  const dayCountSV = useSharedValue(dayCount);

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
  const dividerRadius = (GEO.month.inner + GEO.day.outer) / 2;

  useEffect(() => {
    if (!visible) return;
    const d = value.getDate();
    const m = value.getMonth();
    const y = value.getFullYear();
    const count = daysInMonth(y, m + 1);
    savedValue.current = new Date(value);
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

  useEffect(() => {
    dayCountSV.value = dayCount;
    const clamped = Math.min(day, dayCount);
    if (clamped !== day) setDay(clamped);
    const target = -(clamped - 1) * dayStep(dayCount);
    dayRotation.value = withSpring(target, { damping: 22, stiffness: 220 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayCount]);

  const handleYearChange = useCallback((y: number) => {
    setYear(y);
  }, []);

  const handleToday = useCallback(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();
    const h = now.getHours();
    const min = now.getMinutes();
    const count = daysInMonth(y, m + 1);
    setYear(y);
    setMonth(m);
    setDay(d);
    setHour(h);
    setMinute(min);
    dayCountSV.value = count;
    dayRotation.value = withSpring(-(d - 1) * dayStep(count));
    monthRotation.value = withSpring(-m * MONTH_STEP);
  }, [dayCountSV, dayRotation, monthRotation]);

  const handleCancel = useCallback(() => {
    const sv = savedValue.current;
    const y = sv.getFullYear();
    const m = sv.getMonth();
    const d = sv.getDate();
    const h = sv.getHours();
    const min = sv.getMinutes();
    const count = daysInMonth(y, m + 1);
    setYear(y);
    setMonth(m);
    setDay(d);
    setHour(h);
    setMinute(min);
    dayCountSV.value = count;
    dayRotation.value = -(d - 1) * dayStep(count);
    monthRotation.value = -m * MONTH_STEP;
    onCancel();
  }, [onCancel, dayCountSV, dayRotation, monthRotation]);

  const handleConfirm = useCallback(() => {
    savedValue.current = new Date(year, month, day, hour, minute);
    onConfirm(new Date(year, month, day, hour, minute));
  }, [year, month, day, hour, minute, onConfirm]);

  const handleOpenYearModal = useCallback(() => {
    triggerHaptic();
    setYearModalVisible(true);
  }, [triggerHaptic]);

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

      const midband = (GEO.day.outer + GEO.month.inner) / 2;
      const isDay = dist <= midband;

      if (isDay && dist < GEO.day.inner) {
        manager.fail();
        return;
      }
      if (!isDay && dist > GEO.month.outer) {
        manager.fail();
        return;
      }

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

  const headerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withTiming(interacting === 'month' ? -12 : 0, {
          duration: 250,
        }),
      },
    ],
  }));

  const dayTextStyle = useAnimatedStyle(() => ({
    opacity: withTiming(interacting === 'month' ? 0.45 : 1, { duration: 250 }),
  }));

  const dayActive = interacting === 'day';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <GestureHandlerRootView style={styles.root}>
        <Pressable style={styles.overlay} onPress={handleCancel}>
          <Pressable
            style={[styles.card, { backgroundColor: background }]}
            onPress={() => {}}
          >
            <Animated.View style={[styles.header, headerStyle]}>
              <YearPicker
                year={year}
                textColor={text}
                accentColor={ACCENT}
                onChange={handleYearChange}
                onLongPress={handleOpenYearModal}
                onToday={handleToday}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: `${text}66`,
                  marginTop: 4,
                }}
              >
                {monthFull[month]}
              </Text>
              <Animated.Text
                style={[
                  {
                    fontSize: 44,
                    fontWeight: '700',
                    color: dayActive ? ACCENT : text,
                    lineHeight: 48,
                  },
                  dayTextStyle,
                ]}
              >
                {day}
              </Animated.Text>
            </Animated.View>

            <View style={[styles.ringArea, { width: RING_SIZE, height: RING_SIZE }]}>
              <Svg
                width={RING_SIZE}
                height={RING_SIZE}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              >
                <Circle
                  cx={cx}
                  cy={cx}
                  r={dividerRadius}
                  stroke={`${text}1A`}
                  strokeWidth={1}
                  strokeDasharray="6 4"
                  fill="none"
                />
              </Svg>

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
                    fontSize={13}
                  />
                  <Bezel
                    count={31}
                    labels={allDayLabels}
                    rotation={dayRotation}
                    center={GEO.day.center}
                    width={GEO.day.width}
                    size={RING_SIZE}
                    textColor={text}
                    accentColor={ACCENT}
                    fontSize={12}
                    dimIndices={dimDayIndices}
                  />
                </View>
              </GestureDetector>
            </View>

            <View style={styles.timeArea}>
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

            <View style={[styles.footer, { borderTopColor: `${text}0F` }]}>
              <Pressable
                onPress={handleCancel}
                style={[styles.footerBtn, styles.footerBtnCancel, { backgroundColor: `${text}0D` }]}
              >
                <Text style={{ color: text, fontSize: 15, fontWeight: '600' }}>
                  {t.cancel}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleToday}
                style={[styles.footerBtn, styles.footerBtnToday, { backgroundColor: `${ACCENT}1A` }]}
              >
                <Text style={{ color: ACCENT, fontSize: 15, fontWeight: '600' }}>
                  {t.today}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleConfirm}
                style={[styles.footerBtn, styles.footerBtnDone, { backgroundColor: ACCENT }]}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
                  {t.done}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </GestureHandlerRootView>

      <YearGridModal
        visible={yearModalVisible}
        selected={year}
        textColor={text}
        accentColor={ACCENT}
        background={background}
        onSelect={setYear}
        onClose={() => setYearModalVisible(false)}
      />
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
    borderRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 20,
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
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  ringArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  timeArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 10,
  },
  footerBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
  },
  footerBtnCancel: {
    flex: 0,
  },
  footerBtnToday: {
    flex: 1,
  },
  footerBtnDone: {
    flex: 0,
    minWidth: 100,
  },
});
