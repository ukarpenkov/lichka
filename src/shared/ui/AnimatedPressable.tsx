import React, { useCallback, useState } from 'react';
import { Pressable, type PressableProps, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { SPRING_PRESS } from '../lib/animations';

const AnimatedReanimatedPressable = Animated.createAnimatedComponent(Pressable);

type AnimatedPressableProps = PressableProps & {
  scaleTo?: number;
  pressStyle?: ViewStyle;
};

export function AnimatedPressable({
  scaleTo = 0.95,
  pressStyle,
  children,
  onPressIn,
  onPressOut,
  style,
  ...rest
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);
  const [pressed, setPressed] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(
    (e: any) => {
      setPressed(true);
      scale.value = withSpring(scaleTo, SPRING_PRESS);
      onPressIn?.(e);
    },
    [scaleTo, onPressIn, scale],
  );

  const handlePressOut = useCallback(
    (e: any) => {
      setPressed(false);
      scale.value = withSpring(1, SPRING_PRESS);
      onPressOut?.(e);
    },
    [onPressOut, scale],
  );

  // Один Pressable: layout-стили (flex, width, height) задают hit area,
  // scale применяется к тому же узлу — зона нажатия не сжимается до children.
  return (
    <AnimatedReanimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle, pressed ? pressStyle : undefined]}
      {...rest}>
      {children}
    </AnimatedReanimatedPressable>
  );
}
