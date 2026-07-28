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
import { isScrollAtBottom, isScrollAtTop } from '../scrollEdge';
import { getScheduledChatNavigation } from '../../scheduled/scheduledNavigation';
import { navigateToChat, setMainTabsApi, setChatStackNavigation, __resetMainTabsApiForTests } from '../../../app/mainTabsApi';

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

  describe('6. Not at bottom → entry not activatable', () => {
    it('should disable peek when not at bottom', () => {
      const atBottom = isScrollAtBottom(0, 800, 200);
      expect(atBottom).toBe(false);
      expect(canActivatePeekGesture(true, atBottom, false)).toBe(false);
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
