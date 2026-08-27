jest.mock('../../../shared/lib/launcherShortcut', () => ({
  getInitialShortcutId: jest.fn(),
  consumeInitialShortcut: jest.fn(),
}));

import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';

import {
  getInitialShortcutId,
  consumeInitialShortcut,
} from '../../../shared/lib/launcherShortcut';
import {
  setMainTabsApi,
  setChatStackNavigation,
  __resetMainTabsApiForTests,
} from '../../../app/mainTabsApi';
import {
  handleLauncherShortcut,
  useLauncherShortcut,
  SAVED_MESSAGES_CHAT_ID,
  SHORTCUT_WRITE_SAVED,
} from '../useLauncherShortcut';

const getInitial = getInitialShortcutId as jest.MockedFunction<typeof getInitialShortcutId>;
const consume = consumeInitialShortcut as jest.MockedFunction<typeof consumeInitialShortcut>;

describe('handleLauncherShortcut', () => {
  const switchToTab = jest.fn();
  const navigate = jest.fn();

  beforeEach(() => {
    __resetMainTabsApiForTests();
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
    setMainTabsApi({ switchToTab });
    setChatStackNavigation({ navigate });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should open Saved and request composer focus', () => {
    handleLauncherShortcut(SHORTCUT_WRITE_SAVED);

    expect(switchToTab).toHaveBeenCalledWith(0);
    expect(navigate).toHaveBeenCalledWith('ChatRoom', {
      chatId: SAVED_MESSAGES_CHAT_ID,
      messageId: undefined,
      focusNonce: 1_700_000_000_000,
      composerFocusNonce: 1_700_000_000_000,
    });
  });

  it('should ignore unknown shortcut ids', () => {
    handleLauncherShortcut('scheduled');

    expect(switchToTab).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});

describe('useLauncherShortcut', () => {
  const switchToTab = jest.fn();
  const navigate = jest.fn();
  const originalOS = Platform.OS;
  const remove = jest.fn();
  let shortcutHandler: ((event: { shortcutId?: string }) => void) | undefined;

  beforeEach(() => {
    __resetMainTabsApiForTests();
    jest.clearAllMocks();
    shortcutHandler = undefined;
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'android' });
    NativeModules.ShortcutModule = {
      addListener: jest.fn(),
      removeListeners: jest.fn(),
    };
    jest.spyOn(NativeEventEmitter.prototype, 'addListener').mockImplementation((eventName, handler) => {
      if (eventName === 'onShortcutOpen') {
        shortcutHandler = handler as typeof shortcutHandler;
      }
      return { remove };
    });
    getInitial.mockResolvedValue(null);
    setMainTabsApi({ switchToTab });
    setChatStackNavigation({ navigate });
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => originalOS });
    delete NativeModules.ShortcutModule;
    jest.restoreAllMocks();
  });

  it('should not open Saved when unmounted before getInitial resolves', async () => {
    let resolveInitial: (value: string | null) => void = () => {};
    getInitial.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveInitial = resolve;
        }),
    );

    const { unmount } = renderHook(() => useLauncherShortcut());
    unmount();

    await act(async () => {
      resolveInitial('write_saved');
    });

    expect(consume).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('should consume extras when onShortcutOpen fires and keep later shortcuts working', async () => {
    renderHook(() => useLauncherShortcut());
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      shortcutHandler?.({ shortcutId: 'write_saved' });
    });

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(
      'ChatRoom',
      expect.objectContaining({ chatId: SAVED_MESSAGES_CHAT_ID }),
    );

    act(() => {
      shortcutHandler?.({ shortcutId: 'write_saved' });
    });

    expect(navigate).toHaveBeenCalledTimes(2);
  });

  it('should ignore late getInitial after the event already handled the same shortcut', async () => {
    let resolveInitial: (value: string | null) => void = () => {};
    getInitial.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveInitial = resolve;
        }),
    );

    renderHook(() => useLauncherShortcut());

    act(() => {
      shortcutHandler?.({ shortcutId: 'write_saved' });
    });
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(consume).not.toHaveBeenCalled();

    await act(async () => {
      resolveInitial('write_saved');
    });

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(consume).not.toHaveBeenCalled();
  });

  it('should consume cold-start extras from getInitialShortcutId', async () => {
    getInitial.mockResolvedValue('write_saved');

    renderHook(() => useLauncherShortcut());
    await act(async () => {
      await Promise.resolve();
    });

    expect(consume).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(
      'ChatRoom',
      expect.objectContaining({
        chatId: SAVED_MESSAGES_CHAT_ID,
        composerFocusNonce: 1_700_000_000_000,
      }),
    );
  });
});
