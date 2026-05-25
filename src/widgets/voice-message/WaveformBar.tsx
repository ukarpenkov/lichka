import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../shared/config';

const BAR_COUNT = 32;
const BAR_WIDTH = 3;
const BAR_GAP = 2;
const BAR_HEIGHT = 28;

/** Simple deterministic pseudo-random from a number seed */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

/** Generate bar heights from a stable seed */
function generateHeights(seed: number): number[] {
  const heights: number[] = [];
  for (let i = 0; i < BAR_COUNT; i++) {
    const h = 0.3 + seededRandom(seed + i * 7) * 0.7; // 30%–100% of BAR_HEIGHT
    heights.push(h);
  }
  return heights;
}

type WaveformBarProps = {
  /** 0–1 progress */
  progress: number;
  /** Seed for consistent bar heights per message */
  seed?: number;
};

export function WaveformBar({ progress, seed = 1 }: WaveformBarProps) {
  const { text } = useTheme();
  const heights = useMemo(() => generateHeights(seed), [seed]);

  const totalWidth = BAR_COUNT * (BAR_WIDTH + BAR_GAP) - BAR_GAP;

  const clipStyle = useAnimatedStyle(() => ({
    width: withTiming(totalWidth * progress, { duration: 200 }),
  }));

  return (
    <View style={[styles.container, { width: totalWidth, height: BAR_HEIGHT }]}>
      {/* Background (unplayed) bars */}
      <View style={styles.barsRow}>
        {heights.map((h, i) => (
          <View
            key={i}
            style={[
              styles.bar,
              {
                height: BAR_HEIGHT * h,
                backgroundColor: text + '30',
              },
            ]}
          />
        ))}
      </View>
      {/* Foreground (played) bars — clipped by animated width */}
      <Animated.View style={[styles.clipLayer, clipStyle]} pointerEvents="none">
        <View style={styles.barsRow}>
          {heights.map((h, i) => (
            <View
              key={i}
              style={[
                styles.bar,
                {
                  height: BAR_HEIGHT * h,
                  backgroundColor: text,
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    overflow: 'hidden',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BAR_GAP,
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: 2,
  },
  clipLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: BAR_HEIGHT,
    overflow: 'hidden',
  },
});
