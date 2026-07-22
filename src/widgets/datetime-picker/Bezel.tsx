import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { BezelLabel } from './BezelLabel';

type Props = {
  count: number;
  labels: string[];
  rotation: SharedValue<number>;
  center: number;
  width: number;
  size: number;
  textColor: string;
  accentColor: string;
  fontSize: number;
  /** Angular step in degrees; defaults to 360/count. */
  step?: number;
  dimIndices?: Set<number>;
};

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
  step,
  dimIndices,
}: Props) {
  const cx = size / 2;
  const gradId = `bezel-grad-${center.toFixed(0)}`;

  return (
    <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={textColor} stopOpacity={0.06} />
            <Stop offset="0.5" stopColor={textColor} stopOpacity={0.13} />
            <Stop offset="1" stopColor={textColor} stopOpacity={0.2} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={cx}
          cy={cx}
          r={center}
          stroke={`url(#${gradId})`}
          strokeWidth={width}
          fill="none"
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
          step={step}
          dim={dimIndices?.has(i)}
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
