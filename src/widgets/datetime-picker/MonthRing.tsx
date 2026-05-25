import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { cartesianToAngle, snapToSegment, segmentToAngle, polarToCartesian } from './circularMath';

const RADIUS = 80;
const TEXT_RADIUS = 62;
const SEGMENTS = 12;
const STEP = 360 / SEGMENTS;
const RING_WIDTH = 32;

const MONTH_LABELS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

type Props = {
  selectedMonth: number; // 0–11
  textColor: string;
  accentColor: string;
  size: number;
  onSelect: (month: number) => void;
};

export function MonthRing({ selectedMonth, textColor, accentColor, size, onSelect }: Props) {
  const cx = size / 2;
  const cy = size / 2;

  const selectedIndex = useSharedValue(selectedMonth);

  const handleSelect = (idx: number) => {
    onSelect(idx);
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
          {/* Active segment highlight */}
          <Circle
            cx={cx}
            cy={cy}
            r={RADIUS - RING_WIDTH / 2}
            stroke={`${textColor}33`}
            strokeWidth={RING_WIDTH}
            fill="none"
            strokeDasharray={`${(STEP / 360) * 2 * Math.PI * (RADIUS - RING_WIDTH / 2)} ${2 * Math.PI * (RADIUS - RING_WIDTH / 2)}`}
            strokeDashoffset={-((segmentToAngle(selectedMonth, SEGMENTS) - STEP / 2) / 360) * 2 * Math.PI * (RADIUS - RING_WIDTH / 2)}
            strokeLinecap="round"
          />
          {/* Month labels */}
          {MONTH_LABELS.map((label, i) => {
            const angle = segmentToAngle(i, SEGMENTS);
            const pos = polarToCartesian(cx, cy, TEXT_RADIUS, angle);
            const isSelected = i === selectedMonth;
            return (
              <SvgText
                key={label}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={isSelected ? 12 : 10}
                fontWeight={isSelected ? '700' : '400'}
                fill={isSelected ? accentColor : `${textColor}66`}
              >
                {label}
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
