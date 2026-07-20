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
import {
  useTheme,
  useLocale,
  getMonthLabels,
  getFullMonthNames,
  fonts,
} from '../../shared/config';
import { Text } from '../../shared/ui';
import { hapticTap } from '../../shared/lib';
import { getSettings } from '../../entities/settings';
import { Bezel } from './Bezel';
import { TimeScroller } from './TimeScroller';
import { YearPicker, MIN_YEAR, MAX_YEAR } from './YearPicker';
import { YearGridModal } from './YearGridModal';
import { makeGeometry } from './geometry';
import { daysInMonth } from './circularMath';
import Svg, { Circle } from 'react-native-svg';

/** Fixed picker accents (outside theme pair; same idea as badge/destructive). */
const ACCENT = '#4A9EFF';
const TODAY = '#2EAF6E';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RING_SIZE = Math.min(SCREEN_WIDTH - 40, 312);
const GEO = makeGeometry(RING_SIZE);
const MONTH_COUNT = 12;
const MONTH_STEP = 360 / MONTH_COUNT;

const RING_DAY = 1;
const RING_MONTH = 0;
const RING_NONE = -1;

/** Hidden horizontal swipe: distance / velocity to flip value. */
const SWIPE_DIST = 36;
const SWIPE_VELOCITY = 420;

const SPRING = { damping: 22, stiffness: 220 };

/**
 * Day ring is denser (≈12°/step vs 30° for months) — damp finger→rotation
 * and require >½ step before committing the next day.
 */
const DAY_ROTATION_GAIN = 0.62;
const DAY_STEP_THRESHOLD = 0.62;

function wrapIndex(idx: number, count: number): number {
  'worklet';
  return ((idx % count) + count) % count;
}

/** Shortest signed delta from `from` to continuous index space. */
function shortestDelta(continuous: number, from: number, count: number): number {
  'worklet';
  let d = continuous - from;
  d -= count * Math.round(d / count);
  return d;
}

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
  const { text, background, colors } = useTheme();
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

  /** Hidden swipe: left = next (+1), right = prev (−1). */
  const swipeDelta = useCallback((translationX: number, velocityX: number) => {
    if (Math.abs(translationX) < SWIPE_DIST && Math.abs(velocityX) < SWIPE_VELOCITY) {
      return 0;
    }
    if (translationX <= -SWIPE_DIST || velocityX <= -SWIPE_VELOCITY) return 1;
    if (translationX >= SWIPE_DIST || velocityX >= SWIPE_VELOCITY) return -1;
    return 0;
  }, []);

  const stepYearBy = useCallback(
    (delta: number) => {
      if (delta === 0) return;
      const next = year + delta;
      if (next < MIN_YEAR || next > MAX_YEAR) return;
      setYear(next);
      triggerHaptic();
    },
    [year, triggerHaptic],
  );

  const stepMonthBy = useCallback(
    (delta: number) => {
      if (delta === 0) return;
      const next = ((month + delta) % MONTH_COUNT + MONTH_COUNT) % MONTH_COUNT;
      setMonth(next);
      monthRotation.value = withSpring(-next * MONTH_STEP, SPRING);
      triggerHaptic();
    },
    [month, triggerHaptic, monthRotation],
  );

  const stepDayBy = useCallback(
    (delta: number) => {
      if (delta === 0) return;
      const next = ((day - 1 + delta) % dayCount + dayCount) % dayCount + 1;
      setDay(next);
      dayRotation.value = withSpring(-(next - 1) * dayStep(dayCount), SPRING);
      triggerHaptic();
    },
    [day, dayCount, triggerHaptic, dayRotation],
  );

  const onYearSwipeEnd = useCallback(
    (translationX: number, velocityX: number) => {
      stepYearBy(swipeDelta(translationX, velocityX));
    },
    [stepYearBy, swipeDelta],
  );

  const onMonthSwipeEnd = useCallback(
    (translationX: number, velocityX: number) => {
      stepMonthBy(swipeDelta(translationX, velocityX));
    },
    [stepMonthBy, swipeDelta],
  );

  const onDaySwipeEnd = useCallback(
    (translationX: number, velocityX: number) => {
      stepDayBy(swipeDelta(translationX, velocityX));
    },
    [stepDayBy, swipeDelta],
  );

  const yearSwipe = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-20, 20])
        .failOffsetY([-12, 12])
        .onEnd((e) => {
          'worklet';
          runOnJS(onYearSwipeEnd)(e.translationX, e.velocityX);
        }),
    [onYearSwipeEnd],
  );

  const monthSwipe = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-20, 20])
        .failOffsetY([-12, 12])
        .onEnd((e) => {
          'worklet';
          runOnJS(onMonthSwipeEnd)(e.translationX, e.velocityX);
        }),
    [onMonthSwipeEnd],
  );

  const daySwipe = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-20, 20])
        .failOffsetY([-12, 12])
        .onEnd((e) => {
          'worklet';
          runOnJS(onDaySwipeEnd)(e.translationX, e.velocityX);
        }),
    [onDaySwipeEnd],
  );

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
    dayRotation.value = withSpring(-(d - 1) * dayStep(count), SPRING);
    monthRotation.value = withSpring(-m * MONTH_STEP, SPRING);
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
        dayRotation.value += delta * DAY_ROTATION_GAIN;
      } else {
        monthRotation.value += delta;
      }

      const step = isDay ? dayStep(dayCountSV.value) : MONTH_STEP;
      const count = isDay ? dayCountSV.value : MONTH_COUNT;
      const rot = isDay ? dayRotation.value : monthRotation.value;

      if (isDay) {
        const continuous = -rot / step;
        const d = shortestDelta(continuous, lastDayIdx.value, count);
        let idx = lastDayIdx.value;
        if (Math.abs(d) >= DAY_STEP_THRESHOLD) {
          idx = wrapIndex(lastDayIdx.value + Math.round(d), count);
        }
        if (idx !== lastDayIdx.value) {
          lastDayIdx.value = idx;
          runOnJS(onStepDay)(idx);
        }
      } else {
        const idx = wrapIndex(Math.round(-rot / step), count);
        if (idx !== lastMonthIdx.value) {
          lastMonthIdx.value = idx;
          runOnJS(onStepMonth)(idx);
        }
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

      let idx: number;
      let snapped: number;
      if (isDay) {
        const continuous = -rot.value / step;
        const d = shortestDelta(continuous, lastDayIdx.value, count);
        idx =
          Math.abs(d) < DAY_STEP_THRESHOLD
            ? lastDayIdx.value
            : wrapIndex(lastDayIdx.value + Math.round(d), count);
        snapped = -idx * step;
      } else {
        snapped = Math.round(rot.value / step) * step;
        idx = wrapIndex(Math.round(-snapped / step), count);
      }

      rot.value = withSpring(snapped, SPRING);
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
              <GestureDetector gesture={yearSwipe}>
                <View style={styles.swipeZone}>
                  <YearPicker
                    year={year}
                    textColor={text}
                    accentColor={ACCENT}
                    onChange={handleYearChange}
                    onLongPress={handleOpenYearModal}
                  />
                </View>
              </GestureDetector>
              <GestureDetector gesture={monthSwipe}>
                <View style={styles.swipeZone}>
                  <Text
                    variant="body"
                    style={{
                      fontSize: 16,
                      fontFamily: fonts.medium,
                      color: `${text}66`,
                      marginTop: 4,
                      textAlign: 'center',
                    }}
                  >
                    {monthFull[month]}
                  </Text>
                </View>
              </GestureDetector>
              <GestureDetector gesture={daySwipe}>
                <Animated.View style={styles.swipeZone}>
                  <Animated.Text
                    style={[
                      {
                        fontSize: 44,
                        fontFamily: fonts.bold,
                        fontWeight: '700',
                        color: dayActive ? ACCENT : text,
                        lineHeight: 48,
                        textAlign: 'center',
                      },
                      dayTextStyle,
                    ]}
                  >
                    {day}
                  </Animated.Text>
                </Animated.View>
              </GestureDetector>
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
                style={[styles.footerBtn, styles.footerBtnCancel]}
                hitSlop={8}
              >
                <Text variant="button" style={{ color: colors.destructive }}>
                  {t.cancel}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleToday}
                style={[styles.footerBtn, styles.footerBtnToday]}
                hitSlop={8}
              >
                <Text variant="button" style={{ color: TODAY }}>
                  {t.today}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleConfirm}
                style={[styles.footerBtn, styles.footerBtnDone]}
                hitSlop={8}
              >
                <Text variant="button" style={{ color: ACCENT }}>
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
  swipeZone: {
    width: '100%',
    alignItems: 'center',
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
    paddingHorizontal: 8,
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
    minWidth: 72,
  },
});
