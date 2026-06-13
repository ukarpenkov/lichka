import React, { createContext, useContext, useCallback } from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Avatar, type AvatarProps } from './Avatar';
import { FEATURE_FLAGS } from '../config';
import { SPRING_SOFT } from '../lib/animations';

type SharedElementContextType = {
  registerAvatar: (id: string, frame: { x: number; y: number; width: number; height: number }) => void;
  getAvatarFrame: (id: string) => { x: number; y: number; width: number; height: number } | null;
};

const SharedElementContext = createContext<SharedElementContextType | null>(null);

export function SharedElementProvider({ children }: { children: React.ReactNode }) {
  const frames = new Map<string, { x: number; y: number; width: number; height: number }>();

  const registerAvatar = useCallback(
    (id: string, frame: { x: number; y: number; width: number; height: number }) => {
      frames.set(id, frame);
    },
    [],
  );

  const getAvatarFrame = useCallback(
    (id: string) => frames.get(id) ?? null,
    [],
  );

  return (
    <SharedElementContext.Provider value={{ registerAvatar, getAvatarFrame }}>
      {children}
    </SharedElementContext.Provider>
  );
}

type SharedElementAvatarProps = AvatarProps & {
  sharedId?: string;
  onPress?: () => void;
};

export function SharedElementAvatar({ sharedId, onPress, ...avatarProps }: SharedElementAvatarProps) {
  const scale = useSharedValue(1);
  const opacity = useAnimatedStyle(() => ({
    opacity: scale.value,
  }));

  if (!FEATURE_FLAGS.sharedElementAvatar || !sharedId) {
    return <Avatar {...avatarProps} />;
  }

  return (
    <Animated.View style={opacity}>
      <Avatar {...avatarProps} />
    </Animated.View>
  );
}
