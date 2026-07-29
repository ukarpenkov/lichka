import { canActivatePeekGesture } from '../../../features/chat-future-peek';
import { canListScroll, isScrollAtBottom } from '../scrollEdge';

describe('future peek gesture integration gates', () => {
  it('should enable entry only when history at bottom and not busy', () => {
    const historyAtBottom = true;
    expect(canActivatePeekGesture(true, historyAtBottom, false)).toBe(true);
    expect(canActivatePeekGesture(false, historyAtBottom, false)).toBe(false);
    expect(canActivatePeekGesture(true, false, false)).toBe(false);
  });

  it('should allow entry while keyboard is open (dismiss happens on commit)', () => {
    const keyboardOpen = true;
    const historyAtBottom = true;
    const searchVisible = false;
    const enabled = historyAtBottom && !searchVisible;
    expect(keyboardOpen).toBe(true);
    expect(canActivatePeekGesture(enabled, historyAtBottom, false)).toBe(true);
  });

  it('should enable exit only when future at top', () => {
    expect(canActivatePeekGesture(true, true, false)).toBe(true);
    expect(canActivatePeekGesture(true, false, false)).toBe(false);
  });

  it('should disable nested scroll on empty history so peek pan can activate', () => {
    const contentHeight = 12;
    const layoutHeight = 700;
    expect(isScrollAtBottom(0, contentHeight, layoutHeight)).toBe(true);
    expect(canListScroll(contentHeight, layoutHeight)).toBe(false);
    expect(canActivatePeekGesture(true, true, false)).toBe(true);
  });
});