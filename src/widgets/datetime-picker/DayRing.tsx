import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import Svg, { Circle, Text as SvgText, G } from 'react-native-svg';
import { segmentToAngle, polarToCartesian } from './circularMath';

export const DAY_RADIUS = 130;
export const DAY_TEXT_RADIUS = 108;
export const DAY_SEGMENTS = 31;
export const DAY_STEP = 360 / DAY_SEGMENTS;
export const DAY_RING_WIDTH = 40;
export const DAY_RING_INNER = DAY_RADIUS - DAY_RING_WIDTH / 2;
export const DAY_RING_OUTER = DAY_RADIUS + DAY_RING_WIDTH / 2;

type Props = {
  rotation: SharedValue<number>;
  textColor: string;
  accentColor: string;
  size: number;
};

export function DayRing({ rotation, textColor, accentColor, size }: Props) {
  const cx = size / 2;
  const cy = size / 2;

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const days = Array.from({ length: DAY_SEGMENTS }, (_, i) => i + 1);
  const arcLen =
    (DAY_STEP / 360) * 2 * Math.PI * (DAY_RADIUS - DAY_RING_WIDTH / 2);
  const circumference = 2 * Math.PI * (DAY_RADIUS - DAY_RING_WIDTH / 2);
  const dashOffset = circumference * 0.25 - arcLen / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Selection arc — static, always at top */}
      <Svg
        width={size}
        height={size}
        style={StyleSheet.absoluteFill}
      >
        <Circle
          cx={cx}
          cy={cy}
          r={DAY_RADIUS - DAY_RING_WIDTH / 2}
          stroke={accentColor}
          strokeWidth={DAY_RING_WIDTH}
          fill="none"
          strokeDasharray={`${arcLen} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          opacity={0.9}
        />
      </Svg>

      {/* Rotating ring content */}
      <Animated.View style={[styles.ring, ringAnimatedStyle, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Circle
            cx={cx}
            cy={cy}
            r={DAY_RADIUS - DAY_RING_WIDTH / 2}
            stroke={`${textColor}15`}
            strokeWidth={DAY_RING_WIDTH}
            fill="none"
          />
          {days.map((day) => {
            const angle = segmentToAngle(day - 1, DAY_SEGMENTS);
            const pos = polarToCartesian(cx, cy, DAY_TEXT_RADIUS, angle);
            return (
              <SvgText
                key={day}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize={12}
                fontWeight={'normal' as const}
                fill={`${textColor}88`}
              >
                {day}
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
