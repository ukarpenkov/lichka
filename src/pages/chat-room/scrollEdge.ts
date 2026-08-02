export const SCROLL_EDGE_EPSILON = 24;

export function isScrollAtBottom(
  offsetY: number,
  contentHeight: number,
  layoutHeight: number,
  epsilon: number = SCROLL_EDGE_EPSILON,
): boolean {
  if (layoutHeight <= 0) return true;
  if (contentHeight <= layoutHeight + epsilon) return true;
  return offsetY + layoutHeight >= contentHeight - epsilon;
}

export function isScrollAtTop(
  offsetY: number,
  epsilon: number = SCROLL_EDGE_EPSILON,
): boolean {
  return offsetY <= epsilon;
}

/**
 * True when the list can actually scroll. Empty / short content must return
 * false so nested ScrollView does not steal vertical peek gestures.
 */
export function canListScroll(
  contentHeight: number,
  layoutHeight: number,
  epsilon: number = SCROLL_EDGE_EPSILON,
): boolean {
  if (layoutHeight <= 0) return false;
  return contentHeight > layoutHeight + epsilon;
}

/**
 * Attach Native↔Pan composition only while the nested list can scroll.
 * When content fits the viewport, Gesture.Native still joins the touch arena
 * and fights the outer peek pan — leaving activation only in leftover empty
 * strips (e.g. above the composer/keyboard). Non-scrollable lists must leave
 * the outer Pan alone so it owns the full list pane.
 */
export function shouldAttachNativeScrollGesture(canScroll: boolean): boolean {
  return canScroll;
}

/**
 * When the viewport shrinks (keyboard / composer lift) while the user was at
 * the bottom, offset is stale until scrollToEnd — keep treating as at-bottom
 * so Future peek stays armed over the whole visible list.
 */
export function shouldStickToBottomOnLayoutShrink(
  wasAtBottom: boolean,
  previousLayoutHeight: number,
  nextLayoutHeight: number,
): boolean {
  if (!wasAtBottom) return false;
  if (previousLayoutHeight <= 0 || nextLayoutHeight <= 0) return wasAtBottom;
  return nextLayoutHeight < previousLayoutHeight;
}
