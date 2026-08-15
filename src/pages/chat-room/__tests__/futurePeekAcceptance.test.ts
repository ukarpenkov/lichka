/**
 * Acceptance scenarios for Chat Future Peek MVP (proposal + steps 4–10).
 * Pure logic / API contracts — no device E2E gestures.
 */
import {
  canActivatePeekGesture,
  shouldCommitPeek,
  getPullDistance,
  PEEK_THRESHOLD,
  isPastThreshold,
} from '../../../features/chat-future-peek';
import { resolveTimelineMode } from '../timelineMode';
import { resolveChatRoomBackAction } from '../chatRoomBack';
import { isScrollAtBottom, isScrollAtTop, canListScroll, shouldAttachNativeScrollGesture, shouldStickToBottomOnLayoutShrink } from '../scrollEdge';
import { getScheduledChatNavigation, getFutureToScheduledNavigation } from '../../scheduled/scheduledNavigation';
import {
  navigateToChat,
  navigateToScheduled,
  setMainTabsApi,
  setChatStackNavigation,
  setScheduledFocusListener,
  __resetMainTabsApiForTests,
  SCHEDULED_TAB_INDEX,
} from '../../../app/mainTabsApi';

describe('Future Peek MVP acceptance', () => {
  describe('1. Peek: atBottom + commit → future', () => {
    it('should allow entry only at bottom and commit past threshold', () => {
      const atBottom = isScrollAtBottom(400, 600, 200);
      expect(atBottom).toBe(true);
      expect(canActivatePeekGesture(true, atBottom, false)).toBe(true);

      const pull = getPullDistance(-(PEEK_THRESHOLD + 10), 'enter');
      expect(isPastThreshold(pull)).toBe(true);
      expect(shouldCommitPeek(pull, 0)).toBe(true);
      expect(resolveTimelineMode('future')).toBe('future');
    });

    it('should allow entry from empty history (short content at bottom, scroll disabled)', () => {
      const contentHeight = 0;
      const layoutHeight = 640;
      const atBottom = isScrollAtBottom(0, contentHeight, layoutHeight);
      expect(atBottom).toBe(true);
      expect(canListScroll(contentHeight, layoutHeight)).toBe(false);
      expect(shouldAttachNativeScrollGesture(false)).toBe(false);
      expect(canActivatePeekGesture(true, atBottom, false)).toBe(true);
    });

    it('should allow entry from single-message chat without native scroll composition', () => {
      const contentHeight = 72;
      const layoutHeight = 640;
      expect(isScrollAtBottom(0, contentHeight, layoutHeight)).toBe(true);
      expect(canListScroll(contentHeight, layoutHeight)).toBe(false);
      // Outer pan alone owns the full pane when there is nowhere to scroll.
      expect(shouldAttachNativeScrollGesture(false)).toBe(false);
      expect(canActivatePeekGesture(true, true, false)).toBe(true);
    });
  });

  describe('2. Exit gesture → history (offset restore is ChatRoom responsibility)', () => {
    it('should commit exit pull-down past threshold', () => {
      const atTop = isScrollAtTop(0);
      expect(canActivatePeekGesture(true, atTop, false)).toBe(true);
      const pull = getPullDistance(PEEK_THRESHOLD + 5, 'exit');
      expect(shouldCommitPeek(pull, 0)).toBe(true);
      expect(resolveTimelineMode('history')).toBe('history');
    });
  });

  describe('3. Back in future → history, not pop', () => {
    it('should map back to exit-future while in future', () => {
      expect(resolveChatRoomBackAction('future')).toBe('exit-future');
      expect(resolveChatRoomBackAction('history')).toBe('pop');
    });
  });

  describe('4. Empty future copy keys exist for CTA UI', () => {
    it('should resolve future mode for empty deep link', () => {
      expect(resolveTimelineMode('future')).toBe('future');
    });
  });

  describe('5. Scheduled navigate → future + highlight messageId', () => {
    beforeEach(() => {
      __resetMainTabsApiForTests();
      jest.spyOn(Date, 'now').mockReturnValue(42);
    });

    afterEach(() => {
      jest.restoreAllMocks();
      __resetMainTabsApiForTests();
    });

    it('should pass mode future and messageId through navigateToChat', () => {
      const switchToTab = jest.fn();
      const navigate = jest.fn();
      setMainTabsApi({ switchToTab });
      setChatStackNavigation({ navigate });

      const nav = getScheduledChatNavigation({ chatId: 'c1', id: 'm9' });
      navigateToChat(nav.chatId, nav.messageId, nav.options);

      expect(navigate).toHaveBeenCalledWith('ChatRoom', {
        chatId: 'c1',
        messageId: 'm9',
        focusNonce: 42,
        mode: 'future',
      });
    });
  });

  describe('5b. Future navigate → Scheduled + highlight messageId', () => {
    beforeEach(() => {
      __resetMainTabsApiForTests();
      jest.spyOn(Date, 'now').mockReturnValue(42);
    });

    afterEach(() => {
      jest.restoreAllMocks();
      __resetMainTabsApiForTests();
    });

    it('should switch to Scheduled tab with focus payload', () => {
      const switchToTab = jest.fn();
      const onFocus = jest.fn();
      setMainTabsApi({ switchToTab });
      setScheduledFocusListener(onFocus);

      const nav = getFutureToScheduledNavigation({ id: 'm9' });
      navigateToScheduled(nav.messageId);

      expect(switchToTab).toHaveBeenCalledWith(SCHEDULED_TAB_INDEX);
      expect(onFocus).toHaveBeenCalledWith({
        messageId: 'm9',
        focusNonce: 42,
      });
    });
  });

  describe('6. Not at bottom → entry not activatable', () => {
    it('should disable peek when not at bottom', () => {
      const atBottom = isScrollAtBottom(0, 800, 200);
      expect(atBottom).toBe(false);
      expect(canActivatePeekGesture(true, atBottom, false)).toBe(false);
    });
  });

  describe('6b. Keyboard open → entry still activatable', () => {
    it('should keep peek armed while the keyboard is open (pan is list-only and simultaneous with scroll)', () => {
      const atBottom = true;
      const keyboardOpen = true;
      const searchVisible = false;
      // Entry pan wraps only the list and is simultaneous with the native
      // scroll gesture, so the keyboard must not disarm it.
      const enabled = atBottom && !searchVisible;
      expect(keyboardOpen).toBe(true);
      expect(canActivatePeekGesture(enabled, atBottom, false)).toBe(true);
    });

    it('should stick to bottom when keyboard shrinks viewport so peek stays armed', () => {
      const wasAtBottom = isScrollAtBottom(400, 600, 200);
      expect(wasAtBottom).toBe(true);
      expect(shouldStickToBottomOnLayoutShrink(wasAtBottom, 200, 80)).toBe(true);
      expect(canActivatePeekGesture(true, true, false)).toBe(true);
    });
  });

  describe('6c. At bottom → peek from anywhere on list (not only bottom strip)', () => {
    it('should arm entry whenever atBottom regardless of touch Y on list', () => {
      // Gate is edge-based; Native+Pan composition lets the gesture start on any list row.
      const atBottom = isScrollAtBottom(400, 600, 200);
      expect(atBottom).toBe(true);
      expect(canActivatePeekGesture(true, atBottom, false)).toBe(true);
    });

    it('should enter Future on the next pull-up after scrolling a long history to its end', () => {
      const contentHeight = 900;
      const layoutHeight = 400;
      const bottomOffset = contentHeight - layoutHeight;
      const atBottom = isScrollAtBottom(bottomOffset, contentHeight, layoutHeight);

      expect(canListScroll(contentHeight, layoutHeight)).toBe(true);
      expect(atBottom).toBe(true);
      expect(canActivatePeekGesture(true, atBottom, false)).toBe(true);

      const nextPullUp = getPullDistance(-(PEEK_THRESHOLD + 1), 'enter');
      expect(shouldCommitPeek(nextPullUp, 0)).toBe(true);
    });
  });

  describe('7. Pull below threshold → no commit', () => {
    it('should cancel when released before threshold', () => {
      const pull = getPullDistance(-(PEEK_THRESHOLD - 20), 'enter');
      expect(isPastThreshold(pull)).toBe(false);
      expect(shouldCommitPeek(pull, 0)).toBe(false);
    });
  });
});
