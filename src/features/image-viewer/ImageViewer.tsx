import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  AccessibilityInfo,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../shared/config';

import type { ImageViewerData } from './useImageViewer';

function isLightBackground(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

interface ImageViewerProps {
  visible: boolean;
  data: ImageViewerData | null;
  onClose: () => void;
}

export function ImageViewer({ visible, data, onClose }: ImageViewerProps) {
  const { background, text } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) =>
      setReduceMotion(enabled),
    );
    return () => sub.remove();
  }, []);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const imageTranslateX = useSharedValue(0);
  const imageTranslateY = useSharedValue(0);
  const savedImageTranslateX = useSharedValue(0);
  const savedImageTranslateY = useSharedValue(0);
  const containerTranslateY = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);

  const maxScale = 5;

  useEffect(() => {
    if (visible) {
      scale.value = 1;
      savedScale.value = 1;
      imageTranslateX.value = 0;
      imageTranslateY.value = 0;
      savedImageTranslateX.value = 0;
      savedImageTranslateY.value = 0;
      containerTranslateY.value = 0;
      overlayOpacity.value = reduceMotion
        ? 1
        : withTiming(1, { duration: 200 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, reduceMotion]);

  const close = useCallback(() => {
    if (reduceMotion) {
      onClose();
    } else {
      overlayOpacity.value = withTiming(0, { duration: 200 }, () => {
        runOnJS(onClose)();
      });
    }
  }, [reduceMotion, onClose, overlayOpacity]);

  const dismiss = useCallback(() => {
    if (reduceMotion) {
      runOnJS(onClose)();
    } else {
      overlayOpacity.value = withTiming(0, { duration: 200 }, () => {
        runOnJS(onClose)();
      });
    }
  }, [reduceMotion, onClose, overlayOpacity]);

  const snapBack = useCallback(() => {
    containerTranslateY.value = withSpring(0, reduceMotion ? { duration: 0 } as any : undefined);
    overlayOpacity.value = withTiming(1, reduceMotion ? { duration: 0 } : undefined);
  }, [reduceMotion, containerTranslateY, overlayOpacity]);

  const resetZoom = useCallback(
    (animated: boolean) => {
      const timing = animated && !reduceMotion ? undefined : { duration: 0 };
      savedScale.value = 1;
      savedImageTranslateX.value = 0;
      savedImageTranslateY.value = 0;
      scale.value = withTiming(1, timing);
      imageTranslateX.value = withTiming(0, timing);
      imageTranslateY.value = withTiming(0, timing);
    },
    [reduceMotion, savedScale, savedImageTranslateX, savedImageTranslateY, scale, imageTranslateX, imageTranslateY],
  );

  const toggleZoom = useCallback(
    (animated: boolean) => {
      if (scale.value > 1) {
        const timing = animated && !reduceMotion ? undefined : { duration: 0 };
        savedScale.value = 1;
        savedImageTranslateX.value = 0;
        savedImageTranslateY.value = 0;
        scale.value = withTiming(1, timing);
        imageTranslateX.value = withTiming(0, timing);
        imageTranslateY.value = withTiming(0, timing);
      } else {
        const timing = animated && !reduceMotion ? undefined : { duration: 0 };
        savedScale.value = 2;
        scale.value = withTiming(2, timing);
      }
    },
    [reduceMotion, scale, savedScale, savedImageTranslateX, savedImageTranslateY, imageTranslateX, imageTranslateY],
  );

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.min(maxScale, Math.max(1, savedScale.value * e.scale));
    })
    .onEnd(() => {
      if (scale.value <= 1) {
        runOnJS(resetZoom)(true);
      } else {
        savedScale.value = scale.value;
      }
    });

  const imagePanGesture = Gesture.Pan()
    .maxPointers(1)
    .onUpdate((e) => {
      if (scale.value > 1) {
        imageTranslateX.value = savedImageTranslateX.value + e.translationX;
        imageTranslateY.value = savedImageTranslateY.value + e.translationY;
      } else {
        containerTranslateY.value = Math.max(0, e.translationY);
        overlayOpacity.value = 1 - Math.min(1, containerTranslateY.value / 300);
      }
    })
    .onEnd((e) => {
      if (scale.value > 1) {
        savedImageTranslateX.value = imageTranslateX.value;
        savedImageTranslateY.value = imageTranslateY.value;
      } else if (containerTranslateY.value > 150 || e.velocityY > 500) {
        runOnJS(dismiss)();
      } else {
        runOnJS(snapBack)();
      }
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      runOnJS(toggleZoom)(true);
    });

  const imageGesture = Gesture.Exclusive(
    doubleTapGesture,
    Gesture.Simultaneous(pinchGesture, imagePanGesture),
  );

  const backgroundPanGesture = Gesture.Pan()
    .maxPointers(1)
    .onUpdate((e) => {
      if (scale.value <= 1) {
        containerTranslateY.value = Math.max(0, e.translationY);
        overlayOpacity.value = 1 - Math.min(1, containerTranslateY.value / 300);
      }
    })
    .onEnd(() => {
      if (scale.value <= 1) {
        if (containerTranslateY.value > 150) {
          runOnJS(dismiss)();
        } else {
          runOnJS(snapBack)();
        }
      }
    });

  const backgroundTapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(close)();
  });

  const outerGesture = Gesture.Exclusive(backgroundTapGesture, backgroundPanGesture);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: containerTranslateY.value }],
  }));

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: imageTranslateX.value },
      { translateY: imageTranslateY.value },
      { scale: scale.value },
    ],
  }));

  if (!data) return null;

  const imgWidth = data.width || screenWidth;
  const imgHeight = data.height || screenHeight;
  const imageAspect = imgWidth / imgHeight;
  const screenAspect = screenWidth / screenHeight;

  let displayWidth: number;
  let displayHeight: number;

  if (imageAspect > screenAspect) {
    displayWidth = screenWidth;
    displayHeight = screenWidth / imageAspect;
  } else {
    displayHeight = screenHeight;
    displayWidth = screenHeight * imageAspect;
  }

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="none"
      statusBarTranslucent
      onRequestClose={close}
    >
      <GestureHandlerRootView style={styles.root}>
        <StatusBar
          translucent
          backgroundColor={background}
          barStyle={isLightBackground(background) ? 'dark-content' : 'light-content'}
        />
        <Animated.View style={[styles.overlay, { backgroundColor: background }, overlayAnimatedStyle]}>
          <GestureDetector gesture={outerGesture}>
            <Animated.View style={[styles.container, containerAnimatedStyle]}>
              <GestureDetector gesture={imageGesture}>
                <Animated.View style={[styles.imageWrapper, imageAnimatedStyle]}>
                  <Image
                    source={{ uri: data.uri }}
                    style={{ width: displayWidth, height: displayHeight }}
                    resizeMode="contain"
                  />
                </Animated.View>
              </GestureDetector>
            </Animated.View>
          </GestureDetector>
          {/* Close button */}
          <Animated.View
            style={[
              styles.closeButton,
              {
                top: insets.top + 8,
                right: Math.max(insets.right, 16),
              },
            ]}
          >
            <GestureDetector gesture={Gesture.Tap().onEnd(() => runOnJS(close)())}>
              <Animated.View style={styles.closeHitArea}>
                <X size={28} color={text} />
              </Animated.View>
            </GestureDetector>
          </Animated.View>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {},
  closeButton: {
    position: 'absolute',
    zIndex: 10,
  },
  closeHitArea: {
    padding: 12,
  },
});
