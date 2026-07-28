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
import { withAlpha } from '../../shared/lib/color';
import { Clock, ChevronRight } from '../../shared/ui/pixel';
import type { PeekDirection } from './peekGestureState';

export type FuturePeekOverlayProps = {
  direction: PeekDirection;
  animatedStyle: StyleProp<AnimatedStyle<ViewStyle>>;
  accessibilityLabel?: string;
};

function PeekDownGuide({
  color,
  style,
}: {
  color: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.guide, style]}>
      <View style={[styles.line, { backgroundColor: color }]} />
      <View style={styles.arrowWrap}>
        <ChevronRight color={color} size={16} />
      </View>
    </View>
  );
}

export function FuturePeekOverlay({
  direction,
  animatedStyle,
  accessibilityLabel,
}: FuturePeekOverlayProps) {
  const { text, background } = useTheme();
  const isEnter = direction === 'enter';

  return (
    <Animated.View
      pointerEvents="none"
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={[styles.wrap, animatedStyle]}
    >
      <View style={styles.column}>
        {isEnter ? <View style={styles.flex} /> : <View style={styles.topPad} />}
        <View
          style={[
            styles.badge,
            { backgroundColor: withAlpha(background, 0.92) },
          ]}
        >
          <Clock color={text} size={22} />
          <ChevronRight color={text} size={18} />
        </View>
        {isEnter ? (
          <>
            <PeekDownGuide color={text} style={styles.enterGuide} />
            <View style={styles.enterTail} />
          </>
        ) : (
          <View style={styles.flex}>
            <PeekDownGuide color={text} />
            <View style={styles.flex} />
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  topPad: {
    height: spacing.xxl,
  },
  flex: {
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  guide: {
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
  /** ~50% of icons→compose gap (former paddingBottom = xxl). */
  enterGuide: {
    flex: 0,
    height: spacing.xxl / 2,
  },
  enterTail: {
    height: spacing.xxl / 2,
  },
});
