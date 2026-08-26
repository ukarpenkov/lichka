import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Gesture, type GestureType } from 'react-native-gesture-handler';
import {
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
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

const PEEK_FLICK_CONFIRM_SPRING = {
  duration: 140,
  dampingRatio: 1,
};

export type UseFuturePeekGestureOptions = {
  direction: PeekDirection;
  enabled: boolean;
  /** atBottom for enter (pull up), atTop for exit (pull down). */
  atEdge: boolean;
  onCommit: () => void;
};

export type FuturePeekGestureApi = {
  gesture: ReturnType<typeof Gesture.Pan>;
  /**
   * Handler ref of the pan. Pass to the nested FlatList/ScrollView as
   * `simultaneousHandlers` so the native scroll gesture does not cancel the
   * peek pan (on Android the ScrollView intercepts every vertical drag).
   */
  gestureRef: { current: GestureType | undefined };
  /** Attach to the nested list only while it can scroll. */
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
}: UseFuturePeekGestureOptions): FuturePeekGestureApi {
  const reduceMotion = useReducedMotion();
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

  const gestureRef = useRef<GestureType | undefined>(undefined);

  const nativeGesture = useMemo(() => Gesture.Native(), []);

  const gesture = useMemo(() => {
    // Enter (inverted history at the newest message): pull UP — the native
    // scroll moves toward the newest in that direction, so at the tail it is
    // overscroll-only. Exit (future list at the top): pull DOWN.
    // RNGH activeOffsetY semantics: a range is the zone where NO activation
    // happens; moving outside activates. A negative single value (Start) fires
    // on dy < value (pull up), a positive one (End) on dy > value (pull down).
    const activeOffsetY =
      direction === 'enter' ? -PEEK_ACTIVE_OFFSET_Y : PEEK_ACTIVE_OFFSET_Y;

    const pan = Gesture.Pan()
      .enabled(gestureEnabled)
      .activeOffsetY(activeOffsetY)
      .failOffsetX([-PEEK_FAIL_OFFSET_X, PEEK_FAIL_OFFSET_X])
      .withRef(gestureRef);

    return pan
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

          // A fast flick may commit before reaching the visual threshold.
          // Give it one short confirmation beat: finish the pixel guide and
          // reveal the time icons before switching timelines.
          if (distance < PEEK_THRESHOLD && !reduceMotion) {
            pastThreshold.value = 1;
            phase.value = 'armed';
            pullDistance.value = withSpring(
              PEEK_THRESHOLD,
              PEEK_FLICK_CONFIRM_SPRING,
              (finished) => {
                if (!finished) return;
                pullDistance.value = 0;
                pastThreshold.value = 0;
                phase.value = 'idle';
                thresholdFiredSV.value = 0;
                runOnJS(handleCommit)();
              },
            );
            return;
          }

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
    direction,
    gestureEnabled,
    handleCommit,
    pastThreshold,
    phase,
    pullDistance,
    reduceMotion,
    snapBack,
    thresholdFiredSV,
  ]);

  const overlayStyle = useAnimatedStyle(() => {
    const armed = pastThreshold.value === 1;
    // Time-icon motion (overlay lives outside the rubber-band clip).
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
    gestureRef,
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
