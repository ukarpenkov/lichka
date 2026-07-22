import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';
import { monoWeight } from '../../shared/config';

type Props = {
  index: number;
  count: number;
  label: string;
  rotation: SharedValue<number>;
  radius: number;
  fontSize: number;
  textColor: string;
  accentColor: string;
  /** Angular step in degrees; defaults to 360/count. */
  step?: number;
  dim?: boolean;
};

export function BezelLabel({
  index,
  count,
  label,
  rotation,
  radius,
  fontSize,
  textColor,
  accentColor,
  step: stepProp,
  dim,
}: Props) {
  const step = stepProp ?? 360 / count;
  const dimOpacity = 0.35;

  const style = useAnimatedStyle(() => {
    // Index-space shortest path — safe when count*step > 360 (day spacing > 1×).
    const continuous = -rotation.value / step;
    let d = index - continuous;
    d -= count * Math.round(d / count);
    const a = d * step;
    const dist = Math.abs(a);

    const opacity = interpolate(
      dist,
      [0, step, step * 2.4],
      [1, 0.42, 0],
      Extrapolation.CLAMP,
    );
    const scale = interpolate(dist, [0, step], [1.32, 0.92], Extrapolation.CLAMP);

    const rad = ((a - 90) * Math.PI) / 180;
    const x = radius * Math.cos(rad);
    const y = radius * Math.sin(rad);

    const color = interpolateColor(
      dist,
      [0, step * 0.55],
      [accentColor, textColor],
    );

    const finalOpacity = dim ? opacity * dimOpacity : opacity;

    return {
      opacity: finalOpacity,
      color,
      transform: [{ translateX: x }, { translateY: y }, { scale }],
    };
  });

  return (
    <Animated.View style={styles.fill} pointerEvents="none">
      <Animated.Text style={[styles.label, { fontSize }, style]}>
        {label}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...monoWeight('semiBold'),
    textAlign: 'center',
    includeFontPadding: false,
  },
});
