import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { BezelLabel } from './BezelLabel';

type Props = {
  count: number;
  labels: string[];
  rotation: SharedValue<number>;
  /** Радиус центра штриха кольца */
  center: number;
  width: number;
  size: number;
  textColor: string;
  accentColor: string;
  fontSize: number;
};

/**
 * Вращающийся безель: фоновое кольцо + подсветка слота выбора сверху (12 часов)
 * + метки, плавно проявляющиеся к верхней точке.
 */
export function Bezel({
  count,
  labels,
  rotation,
  center,
  width,
  size,
  textColor,
  accentColor,
  fontSize,
}: Props) {
  const cx = size / 2;
  const step = 360 / count;
  const circumference = 2 * Math.PI * center;
  const arcLen = (step / 360) * circumference;
  const dashOffset = circumference * 0.25 - arcLen / 2;

  return (
    <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* Фоновое кольцо */}
        <Circle
          cx={cx}
          cy={cx}
          r={center}
          stroke={`${textColor}12`}
          strokeWidth={width}
          fill="none"
        />
        {/* Подсветка слота выбора сверху */}
        <Circle
          cx={cx}
          cy={cx}
          r={center}
          stroke={accentColor}
          strokeWidth={width}
          fill="none"
          strokeLinecap="round"
          opacity={0.18}
          strokeDasharray={`${arcLen} ${circumference}`}
          strokeDashoffset={dashOffset}
        />
      </Svg>

      {labels.map((label, i) => (
        <BezelLabel
          key={`${i}-${label}`}
          index={i}
          count={count}
          label={label}
          rotation={rotation}
          radius={center}
          fontSize={fontSize}
          textColor={textColor}
          accentColor={accentColor}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
