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
import { Clock, ChevronRight } from '../../shared/ui/pixel';
import type { PeekDirection } from './peekGestureState';

/** Vertical budget from under icons toward compose (enter). Arrow sits at 50%. */
export const PEEK_ENTER_GUIDE_SPAN = 72;

export type FuturePeekOverlayProps = {
  direction: PeekDirection;
  animatedStyle: StyleProp<AnimatedStyle<ViewStyle>>;
  accessibilityLabel?: string;
};

function PeekDownGuide({
  color,
  span,
}: {
  color: string;
  /** Fixed height; arrow at mid. Omit → fill parent height. */
  span?: number;
}) {
  return (
    <View
      style={[
        styles.guideColumn,
        span != null ? [styles.guideFixed, { height: span }] : styles.guideFlex,
      ]}
    >
      <View style={styles.guideHalf}>
        <View style={[styles.line, { backgroundColor: color }]} />
        <View style={styles.arrowWrap}>
          <ChevronRight color={color} size={14} />
        </View>
      </View>
      <View style={styles.guideHalf} />
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
      style={[styles.layer, isEnter ? styles.anchorEnter : styles.anchorExit]}
    >
      <Animated.View
        accessible
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel}
        style={[styles.cluster, animatedStyle]}
      >
        <View style={styles.icons}>
          <Clock color={text} size={22} />
          <ChevronRight color={text} size={18} />
        </View>
        {isEnter ? (
          <PeekDownGuide color={text} span={PEEK_ENTER_GUIDE_SPAN} />
        ) : (
          <View style={styles.exitGuideSlot}>
            <PeekDownGuide color={text} />
          </View>
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
    transform: [{ rotate: '90deg' }],
  },
  exitGuideSlot: {
    height: 160,
    width: '100%',
  },
});
