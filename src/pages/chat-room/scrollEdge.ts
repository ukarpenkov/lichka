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
