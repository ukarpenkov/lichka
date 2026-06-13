import React, { useCallback } from 'react';
import { Pressable, type PressableProps, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { SPRING_PRESS } from '../lib/animations';

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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(
    (e: any) => {
      scale.value = withSpring(scaleTo, SPRING_PRESS);
      onPressIn?.(e);
    },
    [scaleTo, onPressIn, scale],
  );

  const handlePressOut = useCallback(
    (e: any) => {
      scale.value = withSpring(1, SPRING_PRESS);
      onPressOut?.(e);
    },
    [onPressOut, scale],
  );

  return (
    <Animated.View style={[animatedStyle, pressStyle]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={style}
        {...rest}>
        {children}
      </Pressable>
    </Animated.View>
  );
}
