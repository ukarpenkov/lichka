import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  AccessibilityInfo,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
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

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const PINCH_SENSITIVITY = 3;
const DOUBLE_TAP_SCALE = 2.5;
const DISMISS_DISTANCE = 150;
const DISMISS_VELOCITY = 500;
const OPEN_DURATION = 200;
const CLOSE_DURATION = 200;

function isLightBackground(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.min(max, Math.max(min, value));
}

function clampTranslation(
  translateX: number,
  translateY: number,
  currentScale: number,
  frameWidth: number,
  frameHeight: number,
) {
  'worklet';
  const boundX = Math.max(0, (frameWidth * (currentScale - 1)) / 2);
  const boundY = Math.max(0, (frameHeight * (currentScale - 1)) / 2);
  return {
    x: clamp(translateX, -boundX, boundX),
    y: clamp(translateY, -boundY, boundY),
  };
}

function boostedPinchScale(baseScale: number, gestureScale: number) {
  'worklet';
  const delta = gestureScale - 1;
  return baseScale * (1 + delta * PINCH_SENSITIVITY);
}

function focalZoomTranslation(
  startScale: number,
  startTranslateX: number,
  startTranslateY: number,
  startFocalX: number,
  startFocalY: number,
  focalX: number,
  focalY: number,
  gestureScale: number,
  centerX: number,
  centerY: number,
) {
  'worklet';
  const nextScale = clamp(boostedPinchScale(startScale, gestureScale), MIN_SCALE, MAX_SCALE);
  const scaleRatio = nextScale / startScale;
  const imageCenterX = centerX + startTranslateX;
  const imageCenterY = centerY + startTranslateY;
  const originX = startFocalX - imageCenterX;
  const originY = startFocalY - imageCenterY;

  return {
    scale: nextScale,
    translateX:
      startTranslateX + (focalX - startFocalX) + originX * (1 - scaleRatio),
    translateY:
      startTranslateY + (focalY - startFocalY) + originY * (1 - scaleRatio),
  };
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
  const [internalVisible, setInternalVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const isClosingRef = useRef(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) =>
      setReduceMotion(enabled),
    );
    return () => sub.remove();
  }, []);

  const scale = useSharedValue(1);
  const imageTranslateX = useSharedValue(0);
  const imageTranslateY = useSharedValue(0);
  const containerTranslateY = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);
  const imageOpacity = useSharedValue(0);

  const pinchStartScale = useSharedValue(1);
  const pinchStartTranslateX = useSharedValue(0);
  const pinchStartTranslateY = useSharedValue(0);
  const pinchStartFocalX = useSharedValue(0);
  const pinchStartFocalY = useSharedValue(0);
  const panStartTranslateX = useSharedValue(0);
  const panStartTranslateY = useSharedValue(0);
  const isPinching = useSharedValue(false);

  const centerX = useSharedValue(screenWidth / 2);
  const centerY = useSharedValue(screenHeight / 2);
  const frameWidth = useSharedValue(screenWidth);
  const frameHeight = useSharedValue(screenHeight);

  useEffect(() => {
    centerX.value = screenWidth / 2;
    centerY.value = screenHeight / 2;
  }, [centerX, centerY, screenWidth, screenHeight]);

  useEffect(() => {
    if (visible) {
      isClosingRef.current = false;
      setIsClosing(false);
      setInternalVisible(true);
      cancelAnimation(overlayOpacity);
      cancelAnimation(containerTranslateY);
      cancelAnimation(imageOpacity);
      scale.value = 1;
      imageTranslateX.value = 0;
      imageTranslateY.value = 0;
      containerTranslateY.value = 0;
      panStartTranslateX.value = 0;
      panStartTranslateY.value = 0;
      imageOpacity.value = 0;
      overlayOpacity.value = reduceMotion ? 1 : withTiming(1, { duration: OPEN_DURATION });
    } else if (internalVisible) {
      if (reduceMotion) {
        setInternalVisible(false);
      } else {
        overlayOpacity.value = withTiming(0, { duration: CLOSE_DURATION }, () => {
          runOnJS(setInternalVisible)(false);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, reduceMotion]);

  const close = useCallback(() => {
    if (isClosingRef.current) {
      return;
    }
    isClosingRef.current = true;
    setIsClosing(true);
    onClose();
  }, [onClose]);

  const snapBack = useCallback(() => {
    containerTranslateY.value = withSpring(0, reduceMotion ? { duration: 0 } as any : undefined);
    overlayOpacity.value = withTiming(1, reduceMotion ? { duration: 0 } : undefined);
  }, [reduceMotion, containerTranslateY, overlayOpacity]);

  const resetZoom = useCallback(
    (animated: boolean) => {
      const timing = animated && !reduceMotion ? undefined : { duration: 0 };
      scale.value = withTiming(1, timing);
      imageTranslateX.value = withTiming(0, timing);
      imageTranslateY.value = withTiming(0, timing);
      panStartTranslateX.value = 0;
      panStartTranslateY.value = 0;
    },
    [reduceMotion, panStartTranslateX, panStartTranslateY, scale, imageTranslateX, imageTranslateY],
  );

  const zoomToPoint = useCallback(
    (focalX: number, focalY: number, targetScale: number, animated: boolean) => {
      if (scale.value > MIN_SCALE + 0.01) {
        resetZoom(animated);
        return;
      }

      const timing = animated && !reduceMotion ? undefined : { duration: 0 };
      const nextScale = clamp(targetScale, MIN_SCALE, MAX_SCALE);
      const imageCenterX = centerX.value + imageTranslateX.value;
      const imageCenterY = centerY.value + imageTranslateY.value;
      const originX = focalX - imageCenterX;
      const originY = focalY - imageCenterY;
      const nextTranslateX = imageTranslateX.value + originX * (1 - nextScale / scale.value);
      const nextTranslateY = imageTranslateY.value + originY * (1 - nextScale / scale.value);
      const clamped = clampTranslation(
        nextTranslateX,
        nextTranslateY,
        nextScale,
        frameWidth.value,
        frameHeight.value,
      );

      imageTranslateX.value = withTiming(clamped.x, timing);
      imageTranslateY.value = withTiming(clamped.y, timing);
      scale.value = withTiming(nextScale, timing);
      panStartTranslateX.value = clamped.x;
      panStartTranslateY.value = clamped.y;
    },
    [
      centerX,
      centerY,
      frameHeight,
      frameWidth,
      imageTranslateX,
      imageTranslateY,
      panStartTranslateX,
      panStartTranslateY,
      reduceMotion,
      resetZoom,
      scale,
    ],
  );

  const pinchGesture = Gesture.Pinch()
    .onStart((e) => {
      isPinching.value = true;
      pinchStartScale.value = scale.value;
      pinchStartTranslateX.value = imageTranslateX.value;
      pinchStartTranslateY.value = imageTranslateY.value;
      pinchStartFocalX.value = e.focalX;
      pinchStartFocalY.value = e.focalY;
      panStartTranslateX.value = imageTranslateX.value;
      panStartTranslateY.value = imageTranslateY.value;
    })
    .onUpdate((e) => {
      const next = focalZoomTranslation(
        pinchStartScale.value,
        pinchStartTranslateX.value,
        pinchStartTranslateY.value,
        pinchStartFocalX.value,
        pinchStartFocalY.value,
        e.focalX,
        e.focalY,
        e.scale,
        centerX.value,
        centerY.value,
      );
      const clamped = clampTranslation(
        next.translateX,
        next.translateY,
        next.scale,
        frameWidth.value,
        frameHeight.value,
      );

      scale.value = next.scale;
      imageTranslateX.value = clamped.x;
      imageTranslateY.value = clamped.y;
    })
    .onEnd(() => {
      isPinching.value = false;

      if (scale.value <= MIN_SCALE + 0.02) {
        runOnJS(resetZoom)(true);
        return;
      }

      const clamped = clampTranslation(
        imageTranslateX.value,
        imageTranslateY.value,
        scale.value,
        frameWidth.value,
        frameHeight.value,
      );
      imageTranslateX.value = clamped.x;
      imageTranslateY.value = clamped.y;
      panStartTranslateX.value = clamped.x;
      panStartTranslateY.value = clamped.y;
    })
    .onFinalize(() => {
      isPinching.value = false;
    });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      if (isPinching.value) {
        return;
      }

      panStartTranslateX.value = imageTranslateX.value;
      panStartTranslateY.value = imageTranslateY.value;
    })
    .onUpdate((e) => {
      if (isPinching.value) {
        return;
      }

      if (scale.value > MIN_SCALE + 0.01) {
        const clamped = clampTranslation(
          panStartTranslateX.value + e.translationX,
          panStartTranslateY.value + e.translationY,
          scale.value,
          frameWidth.value,
          frameHeight.value,
        );
        imageTranslateX.value = clamped.x;
        imageTranslateY.value = clamped.y;
        return;
      }

      const isVerticalDismiss =
        Math.abs(e.translationY) > 12 &&
        Math.abs(e.translationY) > Math.abs(e.translationX) * 1.2;

      if (!isVerticalDismiss) {
        return;
      }

      containerTranslateY.value = Math.max(0, e.translationY);
      overlayOpacity.value = 1 - Math.min(1, containerTranslateY.value / 300);
    })
    .onEnd((e) => {
      if (isPinching.value) {
        return;
      }

      if (scale.value > MIN_SCALE + 0.01) {
        const clamped = clampTranslation(
          imageTranslateX.value,
          imageTranslateY.value,
          scale.value,
          frameWidth.value,
          frameHeight.value,
        );
        imageTranslateX.value = clamped.x;
        imageTranslateY.value = clamped.y;
        panStartTranslateX.value = clamped.x;
        panStartTranslateY.value = clamped.y;
        return;
      }

      if (containerTranslateY.value > DISMISS_DISTANCE || e.velocityY > DISMISS_VELOCITY) {
        runOnJS(close)();
      } else {
        runOnJS(snapBack)();
      }
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    .onEnd((e) => {
      runOnJS(zoomToPoint)(e.x, e.y, DOUBLE_TAP_SCALE, true);
    });

  const singleTapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .maxDuration(250)
    .requireExternalGestureToFail(doubleTapGesture)
    .onEnd(() => {
      if (scale.value <= MIN_SCALE + 0.01) {
        runOnJS(close)();
      } else {
        runOnJS(resetZoom)(true);
      }
    });

  const composedGesture = Gesture.Simultaneous(
    Gesture.Exclusive(doubleTapGesture, singleTapGesture),
    Gesture.Simultaneous(pinchGesture, panGesture),
  );

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

  const imageOpacityStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
  }));

  const layout = useMemo(() => {
    if (!data) {
      return null;
    }

    const imgWidth = data.width || screenWidth;
    const imgHeight = data.height || screenHeight;
    const imageAspect = imgWidth / imgHeight;
    const screenAspect = screenWidth / screenHeight;

    if (imageAspect > screenAspect) {
      return {
        displayWidth: screenWidth,
        displayHeight: screenWidth / imageAspect,
      };
    }

    return {
      displayWidth: screenHeight * imageAspect,
      displayHeight: screenHeight,
    };
  }, [data, screenHeight, screenWidth]);

  useLayoutEffect(() => {
    if (!layout) {
      return;
    }

    frameWidth.value = layout.displayWidth;
    frameHeight.value = layout.displayHeight;
  }, [frameHeight, frameWidth, layout]);

  if (!data || !layout) {
    return null;
  }

  const { displayWidth, displayHeight } = layout;

  return (
    <Modal
      visible={internalVisible}
      transparent
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
        <Animated.View
          style={[styles.overlay, { backgroundColor: background }, overlayAnimatedStyle]}
          pointerEvents={isClosing ? 'none' : 'auto'}
        >
          <GestureDetector gesture={composedGesture}>
            <Animated.View style={[styles.container, containerAnimatedStyle]}>
              <Animated.View
                style={[
                  styles.imageFrame,
                  { width: displayWidth, height: displayHeight },
                  imageAnimatedStyle,
                ]}
              >
                <Animated.Image
                  source={{ uri: data.uri }}
                  style={[styles.image, imageOpacityStyle]}
                  resizeMode="contain"
                  onLoad={() => {
                    imageOpacity.value = reduceMotion
                      ? 1
                      : withTiming(1, { duration: OPEN_DURATION });
                  }}
                />
              </Animated.View>
            </Animated.View>
          </GestureDetector>
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
  imageFrame: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    zIndex: 10,
  },
  closeHitArea: {
    padding: 12,
  },
});
