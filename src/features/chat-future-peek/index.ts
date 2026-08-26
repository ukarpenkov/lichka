export {
  PEEK_THRESHOLD,
  PEEK_AUTO_COMMIT,
  PEEK_VELOCITY_COMMIT,
  PEEK_RUBBER_BAND_MAX,
  PEEK_COMMIT_COOLDOWN_MS,
  getPeekGuideProgress,
  getPullDistance,
  getPullVelocity,
  applyRubberBand,
  getPeekPhase,
  isPastThreshold,
  shouldCommitPeek,
  canActivatePeekGesture,
  getRubberBandTranslateY,
} from './peekGestureState';
export type { PeekDirection, PeekPhase } from './peekGestureState';

export {
  useFuturePeekGesture,
  useFuturePeekEntryGesture,
  useFuturePeekExitGesture,
} from './useFuturePeekGesture';
export type {
  UseFuturePeekGestureOptions,
  UseFuturePeekEntryGestureOptions,
  UseFuturePeekExitGestureOptions,
  FuturePeekGestureApi,
} from './useFuturePeekGesture';

export {
  FuturePeekOverlay,
  PEEK_ENTER_GUIDE_SPAN,
  PEEK_EXIT_GUIDE_SPAN,
} from './FuturePeekOverlay';
export type { FuturePeekOverlayProps } from './FuturePeekOverlay';
