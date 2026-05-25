import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, runOnJS } from 'react-native-reanimated';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { cartesianToAngle, snapToSegment, segmentToAngle, polarToCartesian } from './circularMath';

const RADIUS = 130;
const TEXT_RADIUS = 108;
const SEGMENTS = 31;
const STEP = 360 / SEGMENTS;
const RING_WIDTH = 40;

type Props = {
  selectedDay: number; // 1–31
  textColor: string;
  accentColor: string;
  size: number;
  onSelect: (day: number) => void;
};

export function DayRing({ selectedDay, textColor, accentColor, size, onSelect }: Props) {
  const cx = size / 2;
  const cy = size / 2;

  const selectedIndex = useSharedValue(selectedDay - 1);

  const handleSelect = (idx: number) => {
    onSelect(idx + 1);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const angle = cartesianToAngle(cx, cy, e.x, e.y);
      const idx = snapToSegment(angle, SEGMENTS);
      if (idx !== selectedIndex.value) {
        selectedIndex.value = idx;
        runOnJS(handleSelect)(idx);
      }
    });

  const days = Array.from({ length: SEGMENTS }, (_, i) => i + 1);

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          {/* Ring background */}
          <Circle
            cx={cx}
            cy={cy}
            r={RADIUS - RING_WIDTH / 2}
            stroke={`${textColor}15`}
            strokeWidth={RING_WIDTH}
            fill="none"
          />
          {/* Active arc segment */}
          <Circle
            cx={cx}
            cy={cy}
            r={RADIUS - RING_WIDTH / 2}
            stroke={`${textColor}33`}
            strokeWidth={RING_WIDTH}
            fill="none"
            strokeDasharray={`${(STEP / 360) * 2 * Math.PI * (RADIUS - RING_WIDTH / 2)} ${2 * Math.PI * (RADIUS - RING_WIDTH / 2)}`}
            strokeDashoffset={-((segmentToAngle(selectedDay - 1, SEGMENTS) - STEP / 2) / 360) * 2 * Math.PI * (RADIUS - RING_WIDTH / 2)}
            strokeLinecap="round"
          />
          {/* Day labels */}
          {days.map((day) => {
            const angle = segmentToAngle(day - 1, SEGMENTS);
            const pos = polarToCartesian(cx, cy, TEXT_RADIUS, angle);
            const isSelected = day === selectedDay;
            return (
              <SvgText
                key={day}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={isSelected ? 14 : 11}
                fontWeight={isSelected ? '700' : '400'}
                fill={isSelected ? accentColor : `${textColor}66`}
              >
                {day}
              </SvgText>
            );
          })}
        </Svg>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
});
