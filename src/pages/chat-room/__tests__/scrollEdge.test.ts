import {
  canListScroll,
  getInvertedListContentFillStyle,
  getListContentFillStyle,
  getListPointerEvents,
  getNonScrollableListContentStyle,
  isInvertedListAtVisualBottom,
  isInvertedListAtVisualTop,
  isScrollAtBottom,
  isScrollAtTop,
  nextCanListScroll,
  shouldAttachNativeScrollGesture,
  shouldEnableHistoryListScroll,
  shouldStickToBottomOnLayoutExpand,
  shouldStickToBottomOnLayoutShrink,
  CAN_SCROLL_ENTER_OVERFLOW,
  CAN_SCROLL_EXIT_OVERFLOW,
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
    expect(canListScroll(200 + CAN_SCROLL_ENTER_OVERFLOW + 1, 200)).toBe(true);
    expect(canListScroll(200 + CAN_SCROLL_ENTER_OVERFLOW, 200)).toBe(false);
  });

  it('should enable scroll for small overflow so last messages are not clipped', () => {
    const layout = 600;
    expect(nextCanListScroll(false, layout + CAN_SCROLL_ENTER_OVERFLOW, layout)).toBe(
      false,
    );
    expect(
      nextCanListScroll(false, layout + CAN_SCROLL_ENTER_OVERFLOW + 1, layout),
    ).toBe(true);
    // Once scrollable, stay until content fully fits
    expect(nextCanListScroll(true, layout + 10, layout)).toBe(true);
    expect(nextCanListScroll(true, layout + CAN_SCROLL_EXIT_OVERFLOW + 1, layout)).toBe(
      true,
    );
    expect(nextCanListScroll(true, layout + CAN_SCROLL_EXIT_OVERFLOW, layout)).toBe(
      false,
    );
  });

  it('should attach native scroll gesture only when list can scroll', () => {
    expect(shouldAttachNativeScrollGesture(false)).toBe(false);
    expect(shouldAttachNativeScrollGesture(true)).toBe(true);
  });

  it('should pass list touches through empty viewport when not scrollable', () => {
    expect(getListPointerEvents(false)).toBe('box-none');
    expect(getListPointerEvents(true)).toBe('auto');
    expect(getListContentFillStyle()).toEqual({ flexGrow: 1 });
    expect(getNonScrollableListContentStyle()).toEqual({
      pointerEvents: 'box-none',
    });
  });

  it('should keep flexGrow on whether or not the list can scroll', () => {
    expect(getListContentFillStyle().flexGrow).toBe(1);
    expect('flexGrow' in getNonScrollableListContentStyle()).toBe(false);
  });

  it('should pin inverted short content to the composer so leftover space is not a keyboard-sized gap', () => {
    expect(getInvertedListContentFillStyle()).toEqual({
      flexGrow: 1,
      justifyContent: 'flex-end',
    });
  });

  it('should treat inverted offset 0 as the visual bottom (latest above composer)', () => {
    expect(isInvertedListAtVisualBottom(0, 100, 400)).toBe(true);
    expect(isInvertedListAtVisualBottom(0, 900, 400)).toBe(true);
    expect(isInvertedListAtVisualBottom(80, 900, 400)).toBe(false);
  });

  it('should treat inverted high offset as the visual top (oldest messages)', () => {
    expect(isInvertedListAtVisualTop(500, 900, 400)).toBe(true);
    expect(isInvertedListAtVisualTop(0, 900, 400)).toBe(false);
    expect(isInvertedListAtVisualTop(0, 100, 400)).toBe(true);
  });

  it('should stick to bottom when viewport shrinks after being at bottom', () => {
    expect(shouldStickToBottomOnLayoutShrink(true, 700, 400)).toBe(true);
    expect(shouldStickToBottomOnLayoutShrink(true, 400, 700)).toBe(false);
    expect(shouldStickToBottomOnLayoutShrink(false, 700, 400)).toBe(false);
  });

  it('should ignore tiny layout shrink noise for stick-to-bottom', () => {
    expect(shouldStickToBottomOnLayoutShrink(true, 400, 399)).toBe(false);
    expect(shouldStickToBottomOnLayoutShrink(true, 400, 396)).toBe(false);
    expect(shouldStickToBottomOnLayoutShrink(true, 400, 395)).toBe(true);
  });

  it('should stick to bottom when viewport expands after being at bottom', () => {
    expect(shouldStickToBottomOnLayoutExpand(true, 400, 700)).toBe(true);
    expect(shouldStickToBottomOnLayoutExpand(true, 700, 400)).toBe(false);
    expect(shouldStickToBottomOnLayoutExpand(false, 400, 700)).toBe(false);
    expect(shouldStickToBottomOnLayoutExpand(true, 400, 403)).toBe(false);
    expect(shouldStickToBottomOnLayoutExpand(true, 400, 405)).toBe(true);
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
