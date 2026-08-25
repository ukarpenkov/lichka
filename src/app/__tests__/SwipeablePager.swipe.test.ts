import { resolvePagerSwipeTarget } from '../SwipeablePager';

describe('resolvePagerSwipeTarget', () => {
  const width = 400;
  const pageCount = 3;

  it('should commit previous tab when cancelled pan already passed the distance threshold', () => {
    // velocity 0 = cancelled / onFinalize(success=false); gestureX still holds the swipe.
    expect(resolvePagerSwipeTarget(1, 200, 0, width, pageCount)).toBe(0);
  });

  it('should commit next tab when cancelled pan passed the threshold the other way', () => {
    expect(resolvePagerSwipeTarget(1, -200, 0, width, pageCount)).toBe(2);
  });

  it('should snap back to startIndex when the pan is short and slow', () => {
    expect(resolvePagerSwipeTarget(1, 20, 0, width, pageCount)).toBe(1);
  });

  it('should switch on a short but fast swipe', () => {
    expect(resolvePagerSwipeTarget(1, 30, 500, width, pageCount)).toBe(0);
  });

  it('should clamp to the first and last page', () => {
    expect(resolvePagerSwipeTarget(0, 200, 0, width, pageCount)).toBe(0);
    expect(resolvePagerSwipeTarget(2, -200, 0, width, pageCount)).toBe(2);
  });
});
