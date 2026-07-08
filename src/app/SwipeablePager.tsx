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

import { AnimatedPressable } from '../shared/ui';
import { SPRING_SNAP } from '../shared/lib/animations';

export type SwipeablePagerProps = {
  /** Текущий активный индекс (контролируемый). */
  index: number;
  /** Вызывается, когда жест или программный выбор закрепил новый индекс. */
  onIndexChange: (index: number, fromGesture: boolean) => void;
  /** Доступен ли горизонтальный свайп. */
  enabled?: boolean;
  children: React.ReactNode[];
};

const PAN_ACTIVE_OFFSET_X = 20;
const PAN_FAIL_OFFSET_Y = 12;

function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.min(Math.max(value, min), max);
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
        startIndexSV.value = indexSV.value;
        gestureXSV.value = 0;
      })
      .onUpdate((event) => {
        const minGesture = -(count - 1 - startIndexSV.value) * widthSV.value;
        const maxGesture = startIndexSV.value * widthSV.value;
        gestureXSV.value = clamp(event.translationX, minGesture, maxGesture);
      })
      .onEnd((event) => {
        const currentTranslate = -indexSV.value * widthSV.value + gestureXSV.value;
        const currentVisualIndex = -currentTranslate / widthSV.value;
        const velocityBias = (event.velocityX / widthSV.value) * 0.25;

        let target = Math.round(currentVisualIndex + velocityBias);
        target = clamp(target, 0, count - 1);

        // Плавно передаём управление от жеста к пружинной анимации индекса:
        // фиксируем текущее визуальное положение, затем пружиним к целевому индексу.
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
            <View key={i} style={{ width, flex: 1 }}>
              {child}
            </View>
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

export type PagerTabBarProps = {
  count: number;
  activeIndex: number;
  onIndexChange: (index: number, fromGesture: boolean) => void;
  icons: React.ComponentType<{ color: string; size: number }>[];
  activeColor: string;
  inactiveColor: string;
  backgroundColor: string;
  borderColor: string;
};

export function PagerTabBar({
  count,
  activeIndex,
  onIndexChange,
  icons,
  activeColor,
  inactiveColor,
  backgroundColor,
  borderColor,
}: PagerTabBarProps) {
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
          borderTopColor: borderColor,
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
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 56,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
