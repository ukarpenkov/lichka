export type StickyDateListItem =
  | { kind: 'date'; date: string }
  | { kind: 'message'; message: { createdAt: string } };

export type StickyDateViewToken = {
  isViewable: boolean;
  index: number | null;
  item?: StickyDateListItem;
};

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

/**
 * Overlay date for inverted history: highest viewable index is the visual top.
 * Hide the chip while that day’s inline DateSeparator is still on screen.
 */
export function resolveStickyDate(
  viewableItems: readonly StickyDateViewToken[],
): string | null {
  let topIndex = -1;
  let topItem: StickyDateListItem | null = null;
  const viewableDays = new Set<string>();

  for (const token of viewableItems) {
    if (!token.isViewable || !token.item) continue;
    const index = token.index ?? -1;
    if (index >= topIndex) {
      topIndex = index;
      topItem = token.item;
    }
    if (token.item.kind === 'date') {
      viewableDays.add(dayKey(token.item.date));
    }
  }

  if (!topItem || topItem.kind === 'date') return null;

  const createdAt = topItem.message.createdAt;
  if (viewableDays.has(dayKey(createdAt))) return null;
  return createdAt;
}

export function sameStickyDay(a: string | null, b: string | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return dayKey(a) === dayKey(b);
}
