import {
  navigateToChat,
  setMainTabsApi,
  setChatStackNavigation,
  __resetMainTabsApiForTests,
} from '../mainTabsApi';

describe('mainTabsApi', () => {
  const switchToTab = jest.fn();
  const navigate = jest.fn();
  const setParams = jest.fn();
  const getCurrentRoute = jest.fn();

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
    setChatStackNavigation({ navigate, getCurrentRoute, setParams });
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
});
