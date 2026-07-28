import { isScrollAtBottom, isScrollAtTop, SCROLL_EDGE_EPSILON } from '../scrollEdge';

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
});
