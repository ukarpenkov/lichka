import React, { useCallback, useMemo } from 'react';
import { View, useWindowDimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedPressable } from '../shared/ui';
import { SPRING_SNAP } from '../shared/lib/animations';
import { PAGER_TAB_BAR_HEIGHT } from '../shared/lib';

export type SwipeablePagerProps = {
  /** Текущий активный индекс (контролируемый). */
  index: number;
  /** Вызывается, когда жест или программный выбор закрепил новый индекс. */
  onIndexChange: (index: number, fromGesture: boolean) => void;
  /** Доступен ли горизонтальный свайп. */
  enabled?: boolean;
  children: React.ReactNode[];
};

const PAN_ACTIVE_OFFSET_X = 8;
const PAN_FAIL_OFFSET_Y = 28;
const SWIPE_DISTANCE_RATIO = 0.18;
const SWIPE_DISTANCE_MAX = 96;
const SWIPE_MIN_DISTANCE = 28;
const SWIPE_VELOCITY_THRESHOLD = 450;

function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

/** Commit target from the last known pan offset, not event.translationX.
 *  On cancel RNGH may zero the event; gestureX still holds the visual swipe.
 *  Large cancelled pans therefore switch tabs instead of snapping to startIndex. */
export function resolvePagerSwipeTarget(
  startIndex: number,
  gestureX: number,
  velocityX: number,
  width: number,
  pageCount: number,
): number {
  'worklet';
  const distance = Math.abs(gestureX);
  const distanceThreshold = clamp(
    width * SWIPE_DISTANCE_RATIO,
    SWIPE_MIN_DISTANCE,
    SWIPE_DISTANCE_MAX,
  );
  const isFastSwipe =
    distance >= SWIPE_MIN_DISTANCE &&
    Math.abs(velocityX) >= SWIPE_VELOCITY_THRESHOLD;
  const shouldSwitch = distance >= distanceThreshold || isFastSwipe;

  let target = startIndex;
  if (shouldSwitch) {
    target += gestureX < 0 ? 1 : -1;
  }
  return clamp(target, 0, pageCount - 1);
}

export function SwipeablePager({
  index,
  onIndexChange,
  enabled = true,
  children,
}: SwipeablePagerProps) {
  const { width } = useWindowDimensions();
  const count = children.length;

  const indexSV = useSharedValue(index);
  const widthSV = useSharedValue(width);
  const gesturingSV = useSharedValue(0);
  const gestureXSV = useSharedValue(0);
  const startIndexSV = useSharedValue(index);

  React.useEffect(() => {
    widthSV.value = width;
  }, [width, widthSV]);

  // При внешнем изменении индекса анимируем shared value.
  React.useEffect(() => {
    if (gesturingSV.value === 1) return;
    indexSV.value = withSpring(index, SPRING_SNAP);
  }, [index, indexSV, gesturingSV]);

  const commitFromGesture = useCallback(
    (target: number) => {
      onIndexChange(target, true);
    },
    [onIndexChange],
  );

  const panGesture = useMemo(() => {
    return Gesture.Pan()
      .enabled(enabled)
      .activeOffsetX([-PAN_ACTIVE_OFFSET_X, PAN_ACTIVE_OFFSET_X])
      .failOffsetY([-PAN_FAIL_OFFSET_Y, PAN_FAIL_OFFSET_Y])
      .onStart(() => {
        gesturingSV.value = 1;
        startIndexSV.value = Math.round(indexSV.value);
        gestureXSV.value = 0;
      })
      .onUpdate((event) => {
        const minGesture = -(count - 1 - startIndexSV.value) * widthSV.value;
        const maxGesture = startIndexSV.value * widthSV.value;
        gestureXSV.value = clamp(event.translationX, minGesture, maxGesture);
      })
      .onFinalize((event, success) => {
        // onEnd is skipped when the pan is cancelled (list scrollToIndex, failOffsetY).
        // Commit from gestureXSV so a large cancelled swipe still switches tabs.
        if (gesturingSV.value !== 1) {
          return;
        }
        const velocityX = success ? event.velocityX : 0;
        const target = resolvePagerSwipeTarget(
          startIndexSV.value,
          gestureXSV.value,
          velocityX,
          widthSV.value,
          count,
        );

        const currentTranslate = -indexSV.value * widthSV.value + gestureXSV.value;
        const currentVisualIndex = -currentTranslate / widthSV.value;
        indexSV.value = currentVisualIndex;
        gestureXSV.value = 0;
        gesturingSV.value = 0;
        indexSV.value = withSpring(target, SPRING_SNAP);

        runOnJS(commitFromGesture)(target);
      });
  }, [
    enabled,
    count,
    gesturingSV,
    startIndexSV,
    gestureXSV,
    indexSV,
    widthSV,
    commitFromGesture,
  ]);

  const translateX = useDerivedValue(() => {
    const base = -indexSV.value * widthSV.value;
    return base + (gesturingSV.value === 1 ? gestureXSV.value : 0);
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.track,
            { width: width * count },
            animatedStyle,
          ]}>
          {children.map((child, i) => (
            <View key={i} style={[styles.page, { width }]}>
              {child}
            </View>
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

export type PagerTabBarProps = {
  activeIndex: number;
  onIndexChange: (index: number, fromGesture: boolean) => void;
  icons: React.ComponentType<{ color: string; size: number }>[];
  activeColor: string;
  inactiveColor: string;
  backgroundColor: string;
};

export function PagerTabBar({
  activeIndex,
  onIndexChange,
  icons,
  activeColor,
  inactiveColor,
  backgroundColor,
}: PagerTabBarProps) {
  const insets = useSafeAreaInsets();

  const handlePress = useCallback(
    (i: number) => {
      onIndexChange(i, false);
    },
    [onIndexChange],
  );

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor,
          // Контент иконок — фиксированные 56px; home indicator — в paddingBottom.
          height: PAGER_TAB_BAR_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
        },
      ]}>
      {icons.map((Icon, i) => {
        const isActive = i === activeIndex;
        return (
          <AnimatedPressable
            key={i}
            style={styles.tabButton}
            onPress={() => handlePress(i)}
            scaleTo={0.85}>
            <Icon color={isActive ? activeColor : inactiveColor} size={26} />
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  track: {
    flex: 1,
    flexDirection: 'row',
  },
  page: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  // Три равные зоны: каждая занимает 1/3 ширины и всю высоту панели.
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
