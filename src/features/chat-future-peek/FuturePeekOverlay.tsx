import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
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

export function FuturePeekOverlay({
  direction,
  animatedStyle,
  accessibilityLabel,
}: FuturePeekOverlayProps) {
  const { text, background } = useTheme();
  const anchor = direction === 'enter' ? styles.bottom : styles.top;

  return (
    <Animated.View
      pointerEvents="none"
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={[styles.wrap, anchor, animatedStyle]}
    >
      <View
        style={[
          styles.badge,
          {
            backgroundColor: withAlpha(background, 0.92),
            borderColor: withAlpha(text, 0.2),
          },
        ]}
      >
        <Clock color={text} size={22} />
        <ChevronRight color={text} size={18} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    zIndex: 20,
  },
  bottom: {
    justifyContent: 'flex-end',
    paddingBottom: spacing.xxl,
  },
  top: {
    justifyContent: 'flex-start',
    paddingTop: spacing.xxl,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 2,
  },
});
