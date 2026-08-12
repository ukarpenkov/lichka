export const SCROLL_EDGE_EPSILON = 24;

/**
 * Hysteresis for scrollability. Keep the band tight so a few px of overflow
 * still enable scrolling (otherwise last messages stay clipped). Remount flicker
 * is prevented by keeping GestureDetector mounted and by never toggling flexGrow.
 */
export const CAN_SCROLL_ENTER_OVERFLOW = 1;
export const CAN_SCROLL_EXIT_OVERFLOW = 0;

export function isScrollAtBottom(
  offsetY: number,
  contentHeight: number,
  layoutHeight: number,
  epsilon: number = SCROLL_EDGE_EPSILON,
): boolean {
  if (layoutHeight <= 0) return true;
  // Content that actually fits is at-bottom. Do not treat a 24px overflow as
  // "fits" — that hid the last line while peek stayed armed.
  if (contentHeight <= layoutHeight) return true;
  return offsetY + layoutHeight >= contentHeight - epsilon;
}

export function isScrollAtTop(
  offsetY: number,
  epsilon: number = SCROLL_EDGE_EPSILON,
): boolean {
  return offsetY <= epsilon;
}

/**
 * Inverted history list: offset 0 is the visual bottom (latest message,
 * above the composer). Short content that fits is always "at bottom".
 */
export function isInvertedListAtVisualBottom(
  offsetY: number,
  contentHeight: number,
  layoutHeight: number,
  epsilon: number = SCROLL_EDGE_EPSILON,
): boolean {
  if (layoutHeight <= 0) return true;
  if (contentHeight <= layoutHeight) return true;
  return offsetY <= epsilon;
}

/** Inverted history: visual top is the oldest messages (high offset). */
export function isInvertedListAtVisualTop(
  offsetY: number,
  contentHeight: number,
  layoutHeight: number,
  epsilon: number = SCROLL_EDGE_EPSILON,
): boolean {
  if (layoutHeight <= 0) return true;
  if (contentHeight <= layoutHeight) return true;
  return offsetY + layoutHeight >= contentHeight - epsilon;
}

/**
 * True when the list can actually scroll. Empty / short content must return
 * false so nested ScrollView does not steal vertical peek gestures.
 */
export function canListScroll(
  contentHeight: number,
  layoutHeight: number,
  epsilon: number = CAN_SCROLL_ENTER_OVERFLOW,
): boolean {
  if (layoutHeight <= 0) return false;
  return contentHeight > layoutHeight + epsilon;
}

/**
 * Sticky scrollability with tight hysteresis.
 * Wide enter gaps (e.g. 24px) clip the last messages after keyboard dismiss.
 */
export function nextCanListScroll(
  wasScrollable: boolean,
  contentHeight: number,
  layoutHeight: number,
): boolean {
  if (layoutHeight <= 0) return false;
  const overflow = contentHeight - layoutHeight;
  if (wasScrollable) {
    return overflow > CAN_SCROLL_EXIT_OVERFLOW;
  }
  return overflow > CAN_SCROLL_ENTER_OVERFLOW;
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

/**
 * Fill the viewport when content is short. Never toggle this with canScroll —
 * that was the layout feedback loop.
 */
export function getListContentFillStyle(): { flexGrow: number } {
  return { flexGrow: 1 };
}

/**
 * Inverted history: leftover flexGrow space otherwise sits above the composer
 * and changes with keyboard height. flex-end keeps the tail on the composer
 * so the gap stays `MESSAGE_LIST_BOTTOM_GAP` open or closed.
 */
export function getInvertedListContentFillStyle(): {
  flexGrow: number;
  justifyContent: 'flex-end';
} {
  return { flexGrow: 1, justifyContent: 'flex-end' };
}

/** Content container: fill viewport but don't steal touches outside message rows. */
export function getNonScrollableListContentStyle(): {
  pointerEvents: 'box-none';
} {
  return { pointerEvents: 'box-none' };
}

/**
 * When the viewport shrinks (keyboard / composer lift) while the user was at
 * the bottom, offset is stale until layout settles — keep treating as at-bottom
 * so Future peek stays armed over the whole visible list.
 * Ignore sub-pixel / 1–2px noise.
 */
export function shouldStickToBottomOnLayoutShrink(
  wasAtBottom: boolean,
  previousLayoutHeight: number,
  nextLayoutHeight: number,
  minShrinkPx: number = 4,
): boolean {
  if (!wasAtBottom) return false;
  if (previousLayoutHeight <= 0 || nextLayoutHeight <= 0) return wasAtBottom;
  return nextLayoutHeight < previousLayoutHeight - minShrinkPx;
}

/**
 * After keyboard dismiss the viewport grows; keep the last message pinned if
 * the user was already at the bottom (otherwise the tail stays clipped).
 */
export function shouldStickToBottomOnLayoutExpand(
  wasAtBottom: boolean,
  previousLayoutHeight: number,
  nextLayoutHeight: number,
  minExpandPx: number = 4,
): boolean {
  if (!wasAtBottom) return false;
  if (previousLayoutHeight <= 0 || nextLayoutHeight <= 0) return false;
  return nextLayoutHeight > previousLayoutHeight + minExpandPx;
}

/**
 * History list scroll gate. On Android, opening the keyboard must enable
 * scroll even when `historyCanScroll` is stale: reanimated parent padding
 * historically did not deliver FlatList `onLayout`, and a non-scrollable
 * list left maxOffset at 0 while overflow:hidden clipped older messages.
 * iOS is unchanged — only `historyCanScroll` counts.
 */
export function shouldEnableHistoryListScroll(
  historyCanScroll: boolean,
  keyboardOpen: boolean,
  platformOS: 'ios' | 'android' | 'windows' | 'macos' | 'web',
): boolean {
  if (historyCanScroll) return true;
  return keyboardOpen && platformOS === 'android';
}
