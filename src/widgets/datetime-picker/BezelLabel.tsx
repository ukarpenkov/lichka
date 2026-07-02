import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';

type Props = {
  index: number;
  count: number;
  label: string;
  rotation: SharedValue<number>;
  radius: number;
  fontSize: number;
  textColor: string;
  accentColor: string;
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
  dim,
}: Props) {
  const step = 360 / count;
  const base = step * index;
  const dimOpacity = 0.35;

  const style = useAnimatedStyle(() => {
    const onScreen = base + rotation.value;
    let a = ((onScreen % 360) + 360) % 360;
    if (a > 180) a -= 360;
    const dist = Math.abs(a);

    const opacity = interpolate(
      dist,
      [0, step, step * 2.4],
      [1, 0.42, 0],
      Extrapolation.CLAMP,
    );
    const scale = interpolate(dist, [0, step], [1.32, 0.92], Extrapolation.CLAMP);

    const rad = ((onScreen - 90) * Math.PI) / 180;
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
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
