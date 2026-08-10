import {
  canListScroll,
  getListPointerEvents,
  getNonScrollableListContentStyle,
  isScrollAtBottom,
  isScrollAtTop,
  shouldAttachNativeScrollGesture,
  shouldEnableHistoryListScroll,
  shouldStickToBottomOnLayoutShrink,
  SCROLL_EDGE_EPSILON,
} from '../scrollEdge';

describe('scrollEdge', () => {
  it('should treat short content as at bottom', () => {
    expect(isScrollAtBottom(0, 100, 400)).toBe(true);
  });

  it('should detect bottom when offset reaches end', () => {
    expect(isScrollAtBottom(300, 500, 200)).toBe(true);
    expect(isScrollAtBottom(0, 500, 200)).toBe(false);
  });

  it('should detect top near zero offset', () => {
    expect(isScrollAtTop(0)).toBe(true);
    expect(isScrollAtTop(SCROLL_EDGE_EPSILON)).toBe(true);
    expect(isScrollAtTop(SCROLL_EDGE_EPSILON + 1)).toBe(false);
  });

  it('should treat empty and short lists as not scrollable', () => {
    expect(canListScroll(0, 400)).toBe(false);
    expect(canListScroll(100, 400)).toBe(false);
    expect(canListScroll(0, 0)).toBe(false);
  });

  it('should treat overflowing content as scrollable', () => {
    expect(canListScroll(500, 200)).toBe(true);
    expect(canListScroll(200 + SCROLL_EDGE_EPSILON + 1, 200)).toBe(true);
    expect(canListScroll(200 + SCROLL_EDGE_EPSILON, 200)).toBe(false);
  });

  it('should attach native scroll gesture only when list can scroll', () => {
    expect(shouldAttachNativeScrollGesture(false)).toBe(false);
    expect(shouldAttachNativeScrollGesture(true)).toBe(true);
  });

  it('should pass list touches through empty viewport when not scrollable', () => {
    expect(getListPointerEvents(false)).toBe('box-none');
    expect(getListPointerEvents(true)).toBe('auto');
    expect(getNonScrollableListContentStyle()).toEqual({
      flexGrow: 1,
      pointerEvents: 'box-none',
    });
  });

  it('should stick to bottom when viewport shrinks after being at bottom', () => {
    expect(shouldStickToBottomOnLayoutShrink(true, 700, 400)).toBe(true);
    expect(shouldStickToBottomOnLayoutShrink(true, 400, 700)).toBe(false);
    expect(shouldStickToBottomOnLayoutShrink(false, 700, 400)).toBe(false);
  });

  it('should enable history scroll on Android when keyboard is open even if metrics are stale', () => {
    expect(shouldEnableHistoryListScroll(false, true, 'android')).toBe(true);
    expect(shouldEnableHistoryListScroll(false, false, 'android')).toBe(false);
    expect(shouldEnableHistoryListScroll(true, false, 'android')).toBe(true);
  });

  it('should not force history scroll from keyboard on iOS', () => {
    expect(shouldEnableHistoryListScroll(false, true, 'ios')).toBe(false);
    expect(shouldEnableHistoryListScroll(true, true, 'ios')).toBe(true);
  });
});
