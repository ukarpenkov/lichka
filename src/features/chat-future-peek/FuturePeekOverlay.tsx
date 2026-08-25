import React from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';

import { useTheme } from '../../shared/config';
import { spacing } from '../../shared/config/tokens';
import { Clock, ChevronLeft, ChevronRight } from '../../shared/ui/pixel';
import type { PeekDirection } from './peekGestureState';

/** Vertical budget from under icons toward compose (enter). Arrow sits at 50%. */
export const PEEK_ENTER_GUIDE_SPAN = 72;

export type FuturePeekOverlayProps = {
  direction: PeekDirection;
  animatedStyle: StyleProp<AnimatedStyle<ViewStyle>>;
  accessibilityLabel?: string;
};

function PeekGuide({
  color,
  arrow,
  span,
}: {
  color: string;
  arrow: 'up' | 'down';
  /** Fixed height; omit → fill parent height. */
  span?: number;
}) {
  const isUp = arrow === 'up';

  return (
    <View
      style={[
        styles.guideColumn,
        span != null ? [styles.guideFixed, { height: span }] : styles.guideFlex,
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
          <View style={styles.guideHalf}>
            <View style={[styles.line, { backgroundColor: color }]} />
            <View
              testID="future-peek-guide-down"
              style={[styles.arrowWrap, styles.arrowDown]}
            >
              <ChevronRight color={color} size={14} />
            </View>
          </View>
          <View style={styles.guideHalf} />
        </>
      )}
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
  animatedStyle,
  accessibilityLabel,
}: FuturePeekOverlayProps) {
  const { text } = useTheme();
  const isEnter = direction === 'enter';

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
        style={[styles.cluster, animatedStyle]}
      >
        {isEnter ? (
          <>
            <TimeIcons color={text} pointing="right" />
            <PeekGuide color={text} arrow="down" span={PEEK_ENTER_GUIDE_SPAN} />
          </>
        ) : (
          <>
            <View testID="future-peek-exit-guide" style={styles.exitGuideSlot}>
              <PeekGuide color={text} arrow="up" />
            </View>
            <TimeIcons color={text} pointing="left" />
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
  /** Opacity/scale target — sized to content, not full screen (avoids edge clip). */
  cluster: {
    alignItems: 'center',
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  guideColumn: {
    alignItems: 'center',
    width: '100%',
  },
  guideFlex: {
    flex: 1,
  },
  guideFixed: {
    flex: 0,
  },
  guideHalf: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  line: {
    width: 2,
    flex: 1,
  },
  arrowWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowDown: {
    transform: [{ rotate: '90deg' }],
  },
  arrowUp: {
    transform: [{ rotate: '-90deg' }],
  },
  exitGuideSlot: {
    height: 160,
    width: '100%',
  },
});
