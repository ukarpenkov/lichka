import { canActivatePeekGesture } from '../../../features/chat-future-peek';
import {
  canListScroll,
  isScrollAtBottom,
  shouldAttachNativeScrollGesture,
  shouldStickToBottomOnLayoutShrink,
} from '../scrollEdge';

describe('future peek gesture integration gates', () => {
  it('should enable entry only when history at bottom and not busy', () => {
    const historyAtBottom = true;
    expect(canActivatePeekGesture(true, historyAtBottom, false)).toBe(true);
    expect(canActivatePeekGesture(false, historyAtBottom, false)).toBe(false);
    expect(canActivatePeekGesture(true, false, false)).toBe(false);
  });

  it('should disable entry while keyboard is open to protect composer focus', () => {
    const keyboardOpen = true;
    const historyAtBottom = true;
    const searchVisible = false;
    const enabled = historyAtBottom && !searchVisible && !keyboardOpen;
    expect(keyboardOpen).toBe(true);
    expect(canActivatePeekGesture(enabled, historyAtBottom, false)).toBe(false);
  });

  it('should keep at-bottom armed when keyboard shrinks the list viewport', () => {
    const wasAtBottom = isScrollAtBottom(500, 700, 200);
    expect(wasAtBottom).toBe(true);
    // Stale offset after layout shrink would look mid-list without stickiness.
    expect(isScrollAtBottom(500, 700, 120)).toBe(false);
    expect(shouldStickToBottomOnLayoutShrink(wasAtBottom, 200, 120)).toBe(true);
    expect(canActivatePeekGesture(true, true, false)).toBe(true);
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

  it('should omit native scroll composition when short list cannot scroll', () => {
    const contentHeight = 80;
    const layoutHeight = 640;
    expect(canListScroll(contentHeight, layoutHeight)).toBe(false);
    expect(shouldAttachNativeScrollGesture(false)).toBe(false);
    expect(canActivatePeekGesture(true, true, false)).toBe(true);
  });

  it('should keep native scroll composition when list overflows at bottom', () => {
    expect(canListScroll(900, 400)).toBe(true);
    expect(shouldAttachNativeScrollGesture(true)).toBe(true);
    expect(isScrollAtBottom(500, 900, 400)).toBe(true);
    expect(canActivatePeekGesture(true, true, false)).toBe(true);
  });
});
