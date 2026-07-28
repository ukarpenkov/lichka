import { canActivatePeekGesture } from '../../../features/chat-future-peek';

describe('future peek gesture integration gates', () => {
  it('should enable entry only when history at bottom and not busy', () => {
    const historyAtBottom = true;
    const keyboardOpen = false;
    const enabled = !keyboardOpen && historyAtBottom;
    expect(canActivatePeekGesture(enabled, historyAtBottom, false)).toBe(true);
    expect(canActivatePeekGesture(false, historyAtBottom, false)).toBe(false);
    expect(canActivatePeekGesture(true, false, false)).toBe(false);
  });

  it('should enable exit only when future at top', () => {
    expect(canActivatePeekGesture(true, true, false)).toBe(true);
    expect(canActivatePeekGesture(true, false, false)).toBe(false);
  });
});
