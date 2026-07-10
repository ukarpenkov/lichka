import React, { useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';

import { useSeamlessChatStyles } from './useSeamlessChatStyles';
import { SEAMLESS_OPACITY } from './layout';

export type SeamlessBubbleProps = {
  children: React.ReactNode;
  highlighted?: boolean;
  onLongPress?: () => void;
  onPress?: () => void;
  testID?: string;
};

export function SeamlessBubble({
  children,
  highlighted = false,
  onLongPress,
  onPress,
  testID,
}: SeamlessBubbleProps) {
  const styles = useSeamlessChatStyles();

  const handleLongPress = useCallback(() => {
    onLongPress?.();
  }, [onLongPress]);

  return (
    <Animated.View
      entering={FadeInUp.springify().damping(18).stiffness(220)}
      exiting={FadeOutDown.duration(200)}>
      <Pressable
        testID={testID}
        onPress={onPress}
        onLongPress={handleLongPress}
        delayLongPress={300}
        style={({ pressed }) => [
          baseStyles.bubble,
          styles.bubble,
          {
            backgroundColor: highlighted
              ? styles.text + SEAMLESS_OPACITY.bubbleFillHighlighted
              : styles.bubble.backgroundColor,
            shadowOpacity: highlighted ? 0 : styles.bubble.shadowOpacity,
            opacity: pressed ? 0.85 : 1,
          },
        ]}>
        {children}
      </Pressable>
    </Animated.View>
  );
}

const baseStyles = StyleSheet.create({
  bubble: {
    borderWidth: 0,
    maxWidth: '80%',
  },
});
