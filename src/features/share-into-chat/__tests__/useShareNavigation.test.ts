jest.mock('../../../shared/lib/shareIntent', () => ({
  getInitialShare: jest.fn(),
  consumeInitialShare: jest.fn(),
}));

import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';

import {
  getInitialShare,
  consumeInitialShare,
} from '../../../shared/lib/shareIntent';
import {
  revealChatListForShare,
  setMainTabsApi,
  setChatStackNavigation,
  __resetMainTabsApiForTests,
} from '../../../app/mainTabsApi';
import { getShareDraft, __resetSharePickStoreForTests } from '../sharePickStore';
import { useShareNavigation } from '../useShareNavigation';

const getInitial = getInitialShare as jest.MockedFunction<typeof getInitialShare>;
const consume = consumeInitialShare as jest.MockedFunction<typeof consumeInitialShare>;

describe('useShareNavigation', () => {
  const switchToTab = jest.fn();
  const originalOS = Platform.OS;
  const remove = jest.fn();
  let shareHandler: ((event: { text?: string; imagePath?: string }) => void) | undefined;

  beforeEach(() => {
    __resetMainTabsApiForTests();
    __resetSharePickStoreForTests();
    jest.clearAllMocks();
    shareHandler = undefined;
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'android' });
    NativeModules.IncomingShareModule = {
      addListener: jest.fn(),
      removeListeners: jest.fn(),
    };
    jest.spyOn(NativeEventEmitter.prototype, 'addListener').mockImplementation((eventName, handler) => {
      if (eventName === 'onShareReceived') {
        shareHandler = handler as typeof shareHandler;
      }
      return { remove };
    });
    getInitial.mockResolvedValue(null);
    setMainTabsApi({ switchToTab });
    setChatStackNavigation({
      navigate: jest.fn(),
      popToTop: jest.fn(),
    });
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => originalOS });
    delete NativeModules.IncomingShareModule;
    jest.restoreAllMocks();
  });

  it('should not apply a late getInitial after unmount', async () => {
    let resolveInitial: (value: { text: string } | null) => void = () => {};
    getInitial.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveInitial = resolve;
        }),
    );

    const { unmount } = renderHook(() => useShareNavigation());
    unmount();

    await act(async () => {
      resolveInitial({ text: 'https://late.test' });
    });

    expect(consume).not.toHaveBeenCalled();
    expect(getShareDraft()).toBeNull();
  });

  it('should open chat list from onShareReceived and keep later shares working', async () => {
    renderHook(() => useShareNavigation());
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      shareHandler?.({ text: 'https://first.test' });
    });

    expect(getShareDraft()?.text).toBe('https://first.test');
    expect(switchToTab).toHaveBeenCalledWith(0);

    act(() => {
      shareHandler?.({ text: 'https://second.test' });
    });

    expect(getShareDraft()?.text).toBe('https://second.test');
  });

  it('should ignore late getInitial after the event already handled the same share', async () => {
    let resolveInitial: (value: { text: string } | null) => void = () => {};
    getInitial.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveInitial = resolve;
        }),
    );

    renderHook(() => useShareNavigation());

    act(() => {
      shareHandler?.({ text: 'https://same.test' });
    });
    expect(consume).not.toHaveBeenCalled();
    expect(getShareDraft()?.text).toBe('https://same.test');

    await act(async () => {
      resolveInitial({ text: 'https://same.test' });
    });

    expect(consume).not.toHaveBeenCalled();
  });

  it('should consume cold-start extras from getInitialShare', async () => {
    getInitial.mockResolvedValue({ text: 'https://cold.test' });

    renderHook(() => useShareNavigation());
    await act(async () => {
      await Promise.resolve();
    });

    expect(consume).toHaveBeenCalledTimes(1);
    expect(getShareDraft()?.text).toBe('https://cold.test');
  });
});

describe('revealChatListForShare', () => {
  const switchToTab = jest.fn();
  const popToTop = jest.fn();

  beforeEach(() => {
    __resetMainTabsApiForTests();
    jest.clearAllMocks();
  });

  it('should queue until navigation is ready and only switch once', () => {
    revealChatListForShare();
    expect(switchToTab).not.toHaveBeenCalled();

    setMainTabsApi({ switchToTab });
    expect(switchToTab).toHaveBeenCalledWith(0);

    const switchAgain = jest.fn();
    setMainTabsApi({ switchToTab: switchAgain });
    expect(switchAgain).not.toHaveBeenCalled();
  });

  it('should pop the chat stack when nav is already registered', () => {
    setMainTabsApi({ switchToTab });
    setChatStackNavigation({
      navigate: jest.fn(),
      popToTop,
    });

    revealChatListForShare();

    expect(switchToTab).toHaveBeenCalledWith(0);
    expect(popToTop).toHaveBeenCalledTimes(1);
  });
});
