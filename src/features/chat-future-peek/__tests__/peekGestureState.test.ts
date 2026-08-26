import {
  PEEK_AUTO_COMMIT,
  PEEK_THRESHOLD,
  applyRubberBand,
  canActivatePeekGesture,
  getPeekGuideProgress,
  getPeekPhase,
  getPullDistance,
  getPullVelocity,
  getRubberBandTranslateY,
  isPastThreshold,
  shouldCommitPeek,
} from '../peekGestureState';

describe('peekGestureState', () => {
  describe('getPeekGuideProgress', () => {
    it('should clamp progressive guide growth to the threshold', () => {
      expect(getPeekGuideProgress(-10)).toBe(0);
      expect(getPeekGuideProgress(PEEK_THRESHOLD / 2)).toBe(0.5);
      expect(getPeekGuideProgress(PEEK_THRESHOLD)).toBe(1);
      expect(getPeekGuideProgress(PEEK_AUTO_COMMIT)).toBe(1);
    });

    it('should support a custom threshold without division by zero', () => {
      expect(getPeekGuideProgress(25, 100)).toBe(0.25);
      expect(getPeekGuideProgress(1, 0)).toBe(1);
      expect(getPeekGuideProgress(0, 0)).toBe(0);
    });
  });

  describe('getPullDistance', () => {
    it('should use negative translationY for enter (pull up)', () => {
      expect(getPullDistance(-40, 'enter')).toBe(40);
      expect(getPullDistance(20, 'enter')).toBe(0);
    });

    it('should use positive translationY for exit (pull down)', () => {
      expect(getPullDistance(40, 'exit')).toBe(40);
      expect(getPullDistance(-20, 'exit')).toBe(0);
    });
  });

  describe('getPullVelocity', () => {
    it('should invert velocityY for enter', () => {
      expect(getPullVelocity(-500, 'enter')).toBe(500);
      expect(getPullVelocity(100, 'enter')).toBe(-100);
    });

    it('should keep velocityY for exit', () => {
      expect(getPullVelocity(500, 'exit')).toBe(500);
      expect(getPullVelocity(-100, 'exit')).toBe(-100);
    });
  });

  describe('getPeekPhase / isPastThreshold', () => {
    it('should be idle when not pulling', () => {
      expect(getPeekPhase(0)).toBe('idle');
      expect(isPastThreshold(0)).toBe(false);
    });

    it('should be pulling below threshold without arming', () => {
      expect(getPeekPhase(PEEK_THRESHOLD - 1)).toBe('pulling');
      expect(isPastThreshold(PEEK_THRESHOLD - 1)).toBe(false);
    });

    it('should be armed at and above threshold', () => {
      expect(getPeekPhase(PEEK_THRESHOLD)).toBe('armed');
      expect(isPastThreshold(PEEK_THRESHOLD)).toBe(true);
      expect(getPeekPhase(PEEK_THRESHOLD + 20)).toBe('armed');
    });
  });

  describe('shouldCommitPeek', () => {
    it('should commit when past threshold on release', () => {
      expect(shouldCommitPeek(PEEK_THRESHOLD, 0)).toBe(true);
    });

    it('should commit at auto-commit distance', () => {
      expect(shouldCommitPeek(PEEK_AUTO_COMMIT, 0)).toBe(true);
    });

    it('should not commit below threshold with low velocity', () => {
      expect(shouldCommitPeek(PEEK_THRESHOLD - 10, 100)).toBe(false);
    });

    it('should commit with strong velocity after half threshold', () => {
      expect(shouldCommitPeek(PEEK_THRESHOLD * 0.5, 900)).toBe(true);
    });

    it('should cancel when released early', () => {
      expect(shouldCommitPeek(20, 0)).toBe(false);
    });
  });

  describe('canActivatePeekGesture', () => {
    it('should require enabled and atEdge and not busy', () => {
      expect(canActivatePeekGesture(true, true, false)).toBe(true);
      expect(canActivatePeekGesture(false, true, false)).toBe(false);
      expect(canActivatePeekGesture(true, false, false)).toBe(false);
      expect(canActivatePeekGesture(true, true, true)).toBe(false);
    });
  });

  describe('applyRubberBand / getRubberBandTranslateY', () => {
    it('should dampen and clamp rubber-band offset', () => {
      expect(applyRubberBand(0)).toBe(0);
      expect(applyRubberBand(40)).toBeLessThan(40);
      expect(applyRubberBand(400)).toBeLessThanOrEqual(96);
    });

    it('should translate up for enter and down for exit', () => {
      expect(getRubberBandTranslateY(40, 'enter')).toBeLessThan(0);
      expect(getRubberBandTranslateY(40, 'exit')).toBeGreaterThan(0);
    });
  });
});
