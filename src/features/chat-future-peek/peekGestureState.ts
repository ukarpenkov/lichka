export type PeekDirection = 'enter' | 'exit';

export type PeekPhase = 'idle' | 'pulling' | 'armed';

/** Distance (px) at which haptic + icon appear. */
export const PEEK_THRESHOLD = 72;

/** Distance (px) that auto-commits without waiting for finger release. */
export const PEEK_AUTO_COMMIT = 120;

/** Velocity along pull direction that commits on release. */
export const PEEK_VELOCITY_COMMIT = 900;

/** Max visual rubber-band offset. */
export const PEEK_RUBBER_BAND_MAX = 96;

/** Pan must move this far on Y before activating. */
export const PEEK_ACTIVE_OFFSET_Y = 10;

/** Fail pan if horizontal drift exceeds this. */
export const PEEK_FAIL_OFFSET_X = 28;

/** Cooldown after commit before another gesture is accepted. */
export const PEEK_COMMIT_COOLDOWN_MS = 450;

/** Pull distance → clamped visual progress for the progressive guide. */
export function getPeekGuideProgress(
  pullDistance: number,
  threshold?: number,
): number {
  'worklet';
  const fullAt = threshold ?? PEEK_THRESHOLD;
  if (fullAt <= 0) return pullDistance > 0 ? 1 : 0;
  return Math.min(1, Math.max(0, pullDistance / fullAt));
}

/**
 * Signed pan translation → pull distance in the gesture direction.
 * enter: finger up (negative translationY) — overscroll past bottom into future
 * exit: finger down (positive translationY) — overscroll past top back to history
 */
export function getPullDistance(
  translationY: number,
  direction: PeekDirection,
): number {
  'worklet';
  return direction === 'enter'
    ? Math.max(0, -translationY)
    : Math.max(0, translationY);
}

/** Velocity component along the pull direction (positive = toward commit). */
export function getPullVelocity(
  velocityY: number,
  direction: PeekDirection,
): number {
  'worklet';
  return direction === 'enter' ? -velocityY : velocityY;
}

/** Soft rubber-band: dampens pull for visual feedback. */
export function applyRubberBand(
  pullDistance: number,
  max?: number,
): number {
  'worklet';
  const maxOffset = max ?? PEEK_RUBBER_BAND_MAX;
  if (pullDistance <= 0) return 0;
  const damped = pullDistance * 0.55;
  return Math.min(damped, maxOffset);
}

export function getPeekPhase(
  pullDistance: number,
  threshold?: number,
): PeekPhase {
  'worklet';
  const armedAt = threshold ?? PEEK_THRESHOLD;
  if (pullDistance <= 0) return 'idle';
  if (pullDistance < armedAt) return 'pulling';
  return 'armed';
}

export function isPastThreshold(
  pullDistance: number,
  threshold?: number,
): boolean {
  'worklet';
  return pullDistance >= (threshold ?? PEEK_THRESHOLD);
}

/**
 * True when releasing should commit (past threshold or fast flick),
 * or when distance reaches auto-commit during the drag.
 */
export function shouldCommitPeek(
  pullDistance: number,
  pullVelocity: number,
  options?: {
    threshold?: number;
    autoCommit?: number;
    velocityCommit?: number;
  },
): boolean {
  'worklet';
  const threshold = options?.threshold ?? PEEK_THRESHOLD;
  const autoCommit = options?.autoCommit ?? PEEK_AUTO_COMMIT;
  const velocityCommit = options?.velocityCommit ?? PEEK_VELOCITY_COMMIT;

  if (pullDistance >= autoCommit) return true;
  if (pullDistance >= threshold) return true;
  if (pullDistance >= threshold * 0.5 && pullVelocity >= velocityCommit) {
    return true;
  }
  return false;
}

/** Gate: gesture may start only when enabled, at the list edge, and not animating. */
export function canActivatePeekGesture(
  enabled: boolean,
  atEdge: boolean,
  isBusy: boolean,
): boolean {
  return enabled && atEdge && !isBusy;
}

/**
 * Visual translate for overlay / list rubber-band.
 * enter: negative Y (content pulled up), exit: positive Y.
 */
export function getRubberBandTranslateY(
  pullDistance: number,
  direction: PeekDirection,
  max?: number,
): number {
  'worklet';
  const offset = applyRubberBand(pullDistance, max ?? PEEK_RUBBER_BAND_MAX);
  return direction === 'enter' ? -offset : offset;
}
