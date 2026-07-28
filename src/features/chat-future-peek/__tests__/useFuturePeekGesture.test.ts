import {
  canActivatePeekGesture,
  shouldCommitPeek,
  PEEK_THRESHOLD,
} from '../peekGestureState';
import {
  useFuturePeekEntryGesture,
  useFuturePeekExitGesture,
} from '../useFuturePeekGesture';

jest.mock('../../../entities/settings', () => ({
  getSettings: () => ({ hapticEnabled: false }),
}));

jest.mock('../../../shared/lib/haptics', () => ({
  hapticTap: jest.fn(),
}));

describe('future peek gesture wrappers', () => {
  it('entry helper maps atBottom to edge gate semantics', () => {
    expect(canActivatePeekGesture(true, true, false)).toBe(true);
    expect(canActivatePeekGesture(true, false, false)).toBe(false);
  });

  it('exit helper uses same commit rules as entry', () => {
    expect(shouldCommitPeek(PEEK_THRESHOLD, 0)).toBe(true);
    expect(shouldCommitPeek(10, 0)).toBe(false);
  });

  it('should export entry and exit hooks', () => {
    expect(typeof useFuturePeekEntryGesture).toBe('function');
    expect(typeof useFuturePeekExitGesture).toBe('function');
  });
});
