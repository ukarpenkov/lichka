import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

import { getSettings } from '../../entities/settings';
import { SPRING_SNAP } from '../../shared/lib/animations';
import { hapticTap } from '../../shared/lib/haptics';
import {
  PEEK_ACTIVE_OFFSET_Y,
  PEEK_AUTO_COMMIT,
  PEEK_COMMIT_COOLDOWN_MS,
  PEEK_FAIL_OFFSET_X,
  PEEK_THRESHOLD,
  canActivatePeekGesture,
  getPeekPhase,
  getPullDistance,
  getPullVelocity,
  getRubberBandTranslateY,
  isPastThreshold,
  shouldCommitPeek,
  type PeekDirection,
  type PeekPhase,
} from './peekGestureState';

type NativeGesture = ReturnType<typeof Gesture.Native>;

export type UseFuturePeekGestureOptions = {
  direction: PeekDirection;
  enabled: boolean;
  /** atBottom for enter (pull up), atTop for exit (pull down). */
  atEdge: boolean;
  onCommit: () => void;
  /** Nested Native handlers (composer TextInput, etc.) for simultaneous peek pan. */
  extraNativeGestures?: NativeGesture[];
};

function composePeekPanWithNativeGestures(
  pan: ReturnType<typeof Gesture.Pan>,
  natives: NativeGesture[],
): ReturnType<typeof Gesture.Pan> {
  return natives.reduce(
    (composed, native) =>
      composed
        .simultaneousWithExternalGesture(native)
        .blocksExternalGesture(native),
    pan,
  );
}

export type FuturePeekGestureApi = {
  gesture: ReturnType<typeof Gesture.Pan>;
  /**
   * Attach to nested FlatList/ScrollView only while it can scroll
   * (`shouldAttachNativeScrollGesture`). Short lists must omit this wrapper
   * so the outer pan owns the full pane.
   */
  nativeGesture: ReturnType<typeof Gesture.Native>;
  pullDistance: SharedValue<number>;
  pastThreshold: SharedValue<number>;
  phase: SharedValue<PeekPhase>;
  overlayStyle: ReturnType<typeof useAnimatedStyle>;
  rubberBandStyle: ReturnType<typeof useAnimatedStyle>;
  reset: () => void;
};

function triggerThresholdHaptic() {
  if (getSettings().hapticEnabled) {
    hapticTap();
  }
}

export function useFuturePeekGesture({
  direction,
  enabled,
  atEdge,
  onCommit,
  extraNativeGestures = [],
}: UseFuturePeekGestureOptions): FuturePeekGestureApi {
  const pullDistance = useSharedValue(0);
  const pastThreshold = useSharedValue(0);
  const phase = useSharedValue<PeekPhase>('idle');
  const busySV = useSharedValue(0);
  const atEdgeSV = useSharedValue(atEdge ? 1 : 0);
  const thresholdFiredSV = useSharedValue(0);
  const [busy, setBusy] = useState(false);

  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  useEffect(() => {
    atEdgeSV.value = atEdge ? 1 : 0;
  }, [atEdge, atEdgeSV]);

  const clearBusy = useCallback(() => {
    busySV.value = 0;
    setBusy(false);
  }, [busySV]);

  const handleCommit = useCallback(() => {
    busySV.value = 1;
    setBusy(true);
    onCommitRef.current();
    setTimeout(clearBusy, PEEK_COMMIT_COOLDOWN_MS);
  }, [busySV, clearBusy]);

  const snapBack = useCallback(() => {
    pullDistance.value = withSpring(0, SPRING_SNAP, (finished) => {
      if (finished) {
        pastThreshold.value = 0;
        phase.value = 'idle';
        thresholdFiredSV.value = 0;
        busySV.value = 0;
        runOnJS(setBusy)(false);
      }
    });
  }, [busySV, pastThreshold, phase, pullDistance, thresholdFiredSV]);

  const reset = useCallback(() => {
    pullDistance.value = 0;
    pastThreshold.value = 0;
    phase.value = 'idle';
    thresholdFiredSV.value = 0;
    busySV.value = 0;
    setBusy(false);
  }, [busySV, pastThreshold, phase, pullDistance, thresholdFiredSV]);

  const gestureEnabled = canActivatePeekGesture(enabled, atEdge, busy);

  const nativeGesture = useMemo(() => Gesture.Native(), []);
  const composedNativeGestures = useMemo(
    () => [nativeGesture, ...extraNativeGestures],
    [nativeGesture, extraNativeGestures],
  );

  const gesture = useMemo(() => {
    const activeOffset =
      direction === 'enter'
        ? ([-1000, -PEEK_ACTIVE_OFFSET_Y] as [number, number])
        : ([PEEK_ACTIVE_OFFSET_Y, 1000] as [number, number]);

    const pan = Gesture.Pan()
        .enabled(gestureEnabled)
        .activeOffsetY(activeOffset)
        .failOffsetX([-PEEK_FAIL_OFFSET_X, PEEK_FAIL_OFFSET_X]);

    return composePeekPanWithNativeGestures(pan, composedNativeGestures)
        .onBegin(() => {
          if (busySV.value === 1 || atEdgeSV.value !== 1) return;
          thresholdFiredSV.value = 0;
          pastThreshold.value = 0;
          phase.value = 'idle';
        })
        .onUpdate((event) => {
          if (busySV.value === 1 || atEdgeSV.value !== 1) {
            pullDistance.value = 0;
            pastThreshold.value = 0;
            phase.value = 'idle';
            return;
          }

          const distance = getPullDistance(event.translationY, direction);
          pullDistance.value = distance;
          phase.value = getPeekPhase(distance, PEEK_THRESHOLD);

          if (isPastThreshold(distance, PEEK_THRESHOLD)) {
            pastThreshold.value = 1;
            if (thresholdFiredSV.value === 0) {
              thresholdFiredSV.value = 1;
              runOnJS(triggerThresholdHaptic)();
            }
          } else {
            pastThreshold.value = 0;
          }

          if (distance >= PEEK_AUTO_COMMIT) {
            busySV.value = 1;
            pullDistance.value = withSpring(0, SPRING_SNAP);
            pastThreshold.value = 0;
            phase.value = 'idle';
            thresholdFiredSV.value = 0;
            runOnJS(handleCommit)();
          }
        })
        .onEnd((event) => {
          if (busySV.value === 1) {
            pullDistance.value = withSpring(0, SPRING_SNAP);
            return;
          }

          if (atEdgeSV.value !== 1) {
            runOnJS(snapBack)();
            return;
          }

          const distance = getPullDistance(event.translationY, direction);
          const velocity = getPullVelocity(event.velocityY, direction);

          if (shouldCommitPeek(distance, velocity)) {
            busySV.value = 1;
            pullDistance.value = withSpring(0, SPRING_SNAP);
            pastThreshold.value = 0;
            phase.value = 'idle';
            thresholdFiredSV.value = 0;
            runOnJS(handleCommit)();
          } else {
            runOnJS(snapBack)();
          }
        });
  }, [
    atEdgeSV,
    busySV,
    composedNativeGestures,
    direction,
    gestureEnabled,
    handleCommit,
    pastThreshold,
    phase,
    pullDistance,
    snapBack,
    thresholdFiredSV,
  ]);

  const overlayStyle = useAnimatedStyle(() => {
    const armed = pastThreshold.value === 1;
    // Cluster-only motion (overlay lives outside rubber-band clip).
    // Enter: rise from compose; exit: drop from under header.
    const hideY = direction === 'enter' ? 18 : -18;
    return {
      opacity: armed ? 1 : 0,
      transform: [
        { translateY: armed ? 0 : hideY },
        { scale: armed ? 1 : 0.92 },
      ],
    };
  });

  const rubberBandStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: getRubberBandTranslateY(pullDistance.value, direction),
      },
    ],
  }));

  return {
    gesture,
    nativeGesture,
    pullDistance,
    pastThreshold,
    phase,
    overlayStyle,
    rubberBandStyle,
    reset,
  };
}

export type UseFuturePeekEntryGestureOptions = {
  enabled: boolean;
  atBottom: boolean;
  onCommit: () => void;
};

export function useFuturePeekEntryGesture({
  enabled,
  atBottom,
  onCommit,
}: UseFuturePeekEntryGestureOptions): FuturePeekGestureApi {
  return useFuturePeekGesture({
    direction: 'enter',
    enabled,
    atEdge: atBottom,
    onCommit,
  });
}

export type UseFuturePeekExitGestureOptions = {
  enabled: boolean;
  atTop: boolean;
  onCommit: () => void;
};

export function useFuturePeekExitGesture({
  enabled,
  atTop,
  onCommit,
}: UseFuturePeekExitGestureOptions): FuturePeekGestureApi {
  return useFuturePeekGesture({
    direction: 'exit',
    enabled,
    atEdge: atTop,
    onCommit,
  });
}
