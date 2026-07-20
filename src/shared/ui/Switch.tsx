import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../config';
import { SPRING_SNAP } from '../lib/animations';

const TRACK_W = 51;
const TRACK_H = 31;
const THUMB = 27;
const PAD = 2;
const TRAVEL = TRACK_W - THUMB - PAD * 2;

export type SwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

/**
 * Themed switch with a thumb outline so the knob stays visible
 * when thumb fill matches the page canvas (e.g. green-on-black).
 */
export function Switch({ value, onValueChange, disabled }: SwitchProps) {
  const { colors } = useTheme();
  const offset = useSharedValue(value ? TRAVEL : 0);

  useEffect(() => {
    offset.value = withSpring(value ? TRAVEL : 0, SPRING_SNAP);
  }, [value, offset]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={[
        styles.track,
        {
          backgroundColor: value ? colors.switchTrackOn : colors.switchTrackOff,
          opacity: disabled ? 0.4 : 1,
        },
      ]}
    >
      <Animated.View style={[styles.thumbSlot, thumbStyle]}>
        <View
          testID="switch-thumb"
          style={[
            styles.thumb,
            {
              backgroundColor: value ? colors.onInk : colors.muted,
              borderColor: colors.ink,
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    justifyContent: 'center',
  },
  thumbSlot: {
    marginLeft: PAD,
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    borderWidth: 1.5,
  },
});
