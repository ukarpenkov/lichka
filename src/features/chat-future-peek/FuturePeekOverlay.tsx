import React from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  type AnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { useTheme } from '../../shared/config';
import { spacing } from '../../shared/config/tokens';
import { Clock, ChevronLeft, ChevronRight } from '../../shared/ui/pixel';
import {
  getPeekGuideProgress,
  type PeekDirection,
} from './peekGestureState';

/** Vertical guide budgets keep the icon anchors stable while the line grows. */
export const PEEK_ENTER_GUIDE_SPAN = 72;
export const PEEK_EXIT_GUIDE_SPAN = 160;

const GUIDE_PIXEL_STEP = 2;
const GUIDE_OPACITY_LEAD = 2.4;

export type FuturePeekOverlayProps = {
  direction: PeekDirection;
  pullDistance: SharedValue<number>;
  /** Threshold-only reveal style for the clock + time arrow. */
  animatedStyle: StyleProp<AnimatedStyle<ViewStyle>>;
  accessibilityLabel?: string;
};

function PeekGuide({
  color,
  arrow,
  span,
  animatedStyle,
}: {
  color: string;
  arrow: 'up' | 'down';
  span: number;
  animatedStyle: StyleProp<AnimatedStyle<ViewStyle>>;
}) {
  const isUp = arrow === 'up';

  return (
    <View
      testID={`future-peek-guide-slot-${arrow}`}
      style={[styles.guideSlot, { height: span }]}
    >
      <Animated.View
        testID={`future-peek-guide-track-${arrow}`}
        style={[
          styles.guideTrack,
          isUp ? styles.guideTrackUp : styles.guideTrackDown,
          animatedStyle,
        ]}
      >
        {isUp ? (
          <>
            <View
              testID="future-peek-guide-up"
              style={[styles.arrowWrap, styles.arrowUp]}
            >
              <ChevronRight color={color} size={14} />
            </View>
            <View style={[styles.line, { backgroundColor: color }]} />
          </>
        ) : (
          <>
            <View style={[styles.line, { backgroundColor: color }]} />
            <View
              testID="future-peek-guide-down"
              style={[styles.arrowWrap, styles.arrowDown]}
            >
              <ChevronRight color={color} size={14} />
            </View>
          </>
        )}
      </Animated.View>
    </View>
  );
}

function TimeIcons({
  color,
  pointing,
}: {
  color: string;
  pointing: 'left' | 'right';
}) {
  const TimeArrow = pointing === 'left' ? ChevronLeft : ChevronRight;

  return (
    <View style={styles.icons} testID="future-peek-icons">
      <Clock color={color} size={22} />
      <View testID={`future-peek-chevron-${pointing}`}>
        <TimeArrow color={color} size={18} />
      </View>
    </View>
  );
}

export function FuturePeekOverlay({
  direction,
  pullDistance,
  animatedStyle,
  accessibilityLabel,
}: FuturePeekOverlayProps) {
  const { text } = useTheme();
  const isEnter = direction === 'enter';
  const reduceMotion = useReducedMotion();
  const guideSpan = isEnter ? PEEK_ENTER_GUIDE_SPAN : PEEK_EXIT_GUIDE_SPAN;

  const guideStyle = useAnimatedStyle(() => {
    const progress = getPeekGuideProgress(pullDistance.value);
    const growthProgress = reduceMotion && progress > 0 ? 1 : progress;
    const rawHeight = guideSpan * growthProgress;
    const steppedHeight =
      Math.round(rawHeight / GUIDE_PIXEL_STEP) * GUIDE_PIXEL_STEP;

    return {
      height: Math.min(guideSpan, steppedHeight),
      opacity:
        reduceMotion && progress > 0
          ? 1
          : Math.min(1, progress * GUIDE_OPACITY_LEAD),
    };
  });

  return (
    <View
      pointerEvents="none"
      testID={`future-peek-overlay-${direction}`}
      style={[styles.layer, isEnter ? styles.anchorEnter : styles.anchorExit]}
    >
      <Animated.View
        accessible
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel}
        testID="future-peek-cluster"
        style={styles.cluster}
      >
        {isEnter ? (
          <>
            <Animated.View
              testID="future-peek-icons-layer"
              style={[styles.iconsLayer, animatedStyle]}
            >
              <TimeIcons color={text} pointing="right" />
            </Animated.View>
            <PeekGuide
              color={text}
              arrow="down"
              span={guideSpan}
              animatedStyle={guideStyle}
            />
          </>
        ) : (
          <>
            <PeekGuide
              color={text}
              arrow="up"
              span={guideSpan}
              animatedStyle={guideStyle}
            />
            <Animated.View
              testID="future-peek-icons-layer"
              style={[styles.iconsLayer, animatedStyle]}
            >
              <TimeIcons color={text} pointing="left" />
            </Animated.View>
          </>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  /** Sits above the list rubber-band; must NOT be clipped by listPane. */
  layer: {
    ...StyleSheet.absoluteFill,
    zIndex: 20,
    alignItems: 'center',
  },
  anchorEnter: {
    justifyContent: 'flex-end',
  },
  anchorExit: {
    justifyContent: 'flex-start',
    paddingTop: spacing.xxl,
  },
  /** Stable layout shell — sized to content, not full screen (avoids edge clip). */
  cluster: {
    alignItems: 'center',
  },
  /** Threshold-only opacity/scale target; the guide remains independent. */
  iconsLayer: {
    alignItems: 'center',
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  guideSlot: {
    width: 18,
    position: 'relative',
  },
  guideTrack: {
    position: 'absolute',
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  guideTrackUp: {
    bottom: 0,
  },
  guideTrackDown: {
    top: 0,
  },
  line: {
    width: 2,
    flex: 1,
  },
  arrowWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 14,
    height: 14,
  },
  arrowDown: {
    transform: [{ rotate: '90deg' }],
  },
  arrowUp: {
    transform: [{ rotate: '-90deg' }],
  },
});
