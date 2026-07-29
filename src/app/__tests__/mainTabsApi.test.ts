import {
  navigateToChat,
  navigateToScheduled,
  setMainTabsApi,
  setChatStackNavigation,
  setScheduledFocusListener,
  popChatStackToTop,
  __resetMainTabsApiForTests,
  SCHEDULED_TAB_INDEX,
} from '../mainTabsApi';

describe('mainTabsApi', () => {
  const switchToTab = jest.fn();
  const navigate = jest.fn();
  const setParams = jest.fn();
  const getCurrentRoute = jest.fn();
  const popToTop = jest.fn();

  beforeEach(() => {
    __resetMainTabsApiForTests();
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function readyNav(currentRoute?: { name: string; params?: { chatId?: string } }) {
    getCurrentRoute.mockReturnValue(currentRoute);
    setMainTabsApi({ switchToTab });
    setChatStackNavigation({ navigate, getCurrentRoute, setParams, popToTop });
  }

  describe('navigateToChat', () => {
    it('should navigate with mode future when options.mode is future', () => {
      readyNav();

      navigateToChat('chat-1', 'msg-1', { mode: 'future' });

      expect(switchToTab).toHaveBeenCalledWith(0);
      expect(navigate).toHaveBeenCalledWith('ChatRoom', {
        chatId: 'chat-1',
        messageId: 'msg-1',
        focusNonce: 1_700_000_000_000,
        mode: 'future',
      });
    });

    it('should omit mode when called without options', () => {
      readyNav();

      navigateToChat('chat-1', 'msg-1');

      expect(navigate).toHaveBeenCalledWith('ChatRoom', {
        chatId: 'chat-1',
        messageId: 'msg-1',
        focusNonce: 1_700_000_000_000,
      });
      const params = navigate.mock.calls[0][1];
      expect(params).not.toHaveProperty('mode');
    });

    it('should omit mode when options has no mode', () => {
      readyNav();

      navigateToChat('chat-1');

      const params = navigate.mock.calls[0][1];
      expect(params.chatId).toBe('chat-1');
      expect(params).not.toHaveProperty('mode');
    });

    it('should queue pending with mode and flush when nav becomes ready', () => {
      navigateToChat('chat-2', 'msg-2', { mode: 'future' });

      expect(navigate).not.toHaveBeenCalled();

      readyNav();

      expect(switchToTab).toHaveBeenCalledWith(0);
      expect(navigate).toHaveBeenCalledWith('ChatRoom', {
        chatId: 'chat-2',
        messageId: 'msg-2',
        focusNonce: 1_700_000_000_000,
        mode: 'future',
      });
    });

    it('should setParams with mode when ChatRoom for same chat is already open', () => {
      readyNav({ name: 'ChatRoom', params: { chatId: 'chat-1' } });

      navigateToChat('chat-1', 'msg-9', { mode: 'future' });

      expect(setParams).toHaveBeenCalledWith({
        chatId: 'chat-1',
        messageId: 'msg-9',
        focusNonce: 1_700_000_000_000,
        mode: 'future',
      });
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  describe('navigateToScheduled', () => {
    it('should switch to Scheduled tab and notify focus listener', () => {
      const onFocus = jest.fn();
      setMainTabsApi({ switchToTab });
      setScheduledFocusListener(onFocus);

      navigateToScheduled('msg-42');

      expect(switchToTab).toHaveBeenCalledWith(SCHEDULED_TAB_INDEX);
      expect(onFocus).toHaveBeenCalledWith({
        messageId: 'msg-42',
        focusNonce: 1_700_000_000_000,
      });
    });

    it('should deliver pending focus when listener registers after navigate', () => {
      setMainTabsApi({ switchToTab });
      navigateToScheduled('msg-pending');

      const onFocus = jest.fn();
      setScheduledFocusListener(onFocus);

      expect(onFocus).toHaveBeenCalledWith({
        messageId: 'msg-pending',
        focusNonce: 1_700_000_000_000,
      });
    });
  });

  describe('popChatStackToTop', () => {
    it('should pop chat stack to list when navigation is registered', () => {
      readyNav({ name: 'ChatRoom', params: { chatId: 'chat-1' } });

      popChatStackToTop();

      expect(popToTop).toHaveBeenCalledTimes(1);
    });

    it('should no-op when chat stack navigation is not registered', () => {
      popChatStackToTop();

      expect(popToTop).not.toHaveBeenCalled();
    });
  });
});
