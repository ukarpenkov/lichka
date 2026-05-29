import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { useLocale, getMonthLabels } from '../../shared/config';
import { segmentToAngle, polarToCartesian } from './circularMath';

export const MONTH_RADIUS = 80;
export const MONTH_TEXT_RADIUS = 62;
export const MONTH_SEGMENTS = 12;
export const MONTH_STEP = 360 / MONTH_SEGMENTS;
export const MONTH_RING_WIDTH = 32;
export const MONTH_RING_INNER = MONTH_RADIUS - MONTH_RING_WIDTH / 2;
export const MONTH_RING_OUTER = MONTH_RADIUS + MONTH_RING_WIDTH / 2;

type Props = {
  rotation: SharedValue<number>;
  textColor: string;
  accentColor: string;
  size: number;
};

export function MonthRing({ rotation, textColor, accentColor, size }: Props) {
  const { locale } = useLocale();
  const monthLabels = getMonthLabels(locale);
  const cx = size / 2;
  const cy = size / 2;

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const arcLen =
    (MONTH_STEP / 360) * 2 * Math.PI * (MONTH_RADIUS - MONTH_RING_WIDTH / 2);
  const circumference = 2 * Math.PI * (MONTH_RADIUS - MONTH_RING_WIDTH / 2);
  const dashOffset = circumference * 0.25 - arcLen / 2;

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      pointerEvents="none"
    >
      {/* Selection arc — static, always at top */}
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={cx}
          cy={cy}
          r={MONTH_RADIUS - MONTH_RING_WIDTH / 2}
          stroke={accentColor}
          strokeWidth={MONTH_RING_WIDTH}
          fill="none"
          strokeDasharray={`${arcLen} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          opacity={0.9}
        />
      </Svg>

      {/* Rotating ring content */}
      <Animated.View
        style={[styles.ring, ringAnimatedStyle, { width: size, height: size }]}
      >
        <Svg width={size} height={size}>
          <Circle
            cx={cx}
            cy={cy}
            r={MONTH_RADIUS - MONTH_RING_WIDTH / 2}
            stroke={`${textColor}15`}
            strokeWidth={MONTH_RING_WIDTH}
            fill="none"
          />
          {monthLabels.map((label, i) => {
            const angle = segmentToAngle(i, MONTH_SEGMENTS);
            const pos = polarToCartesian(cx, cy, MONTH_TEXT_RADIUS, angle);
            return (
              <SvgText
                key={label}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize={11}
                fontWeight={'normal' as const}
                fill={`${textColor}88`}
              >
                {label}
              </SvgText>
            );
          })}
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  ring: {
    position: 'absolute',
  },
});
