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

/** FlatList/ScrollView: let empty viewport pass touches to the outer peek pan. */
export function getListPointerEvents(
  canScroll: boolean,
): 'auto' | 'box-none' {
  return canScroll ? 'auto' : 'box-none';
}

/** Content container: fill viewport but don't steal touches outside message rows. */
export function getNonScrollableListContentStyle(): {
  flexGrow: number;
  pointerEvents: 'box-none';
} {
  return { flexGrow: 1, pointerEvents: 'box-none' };
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

/**
 * History list scroll gate. On Android, opening the keyboard must enable
 * scroll even when `historyCanScroll` is stale: reanimated parent padding
 * historically did not deliver FlatList `onLayout`, and `flexGrow: 1` for
 * non-scrollable lists left maxOffset at 0 while overflow:hidden clipped
 * older messages. iOS is unchanged — only `historyCanScroll` counts.
 */
export function shouldEnableHistoryListScroll(
  historyCanScroll: boolean,
  keyboardOpen: boolean,
  platformOS: 'ios' | 'android' | 'windows' | 'macos' | 'web',
): boolean {
  if (historyCanScroll) return true;
  return keyboardOpen && platformOS === 'android';
}
