jest.mock('../../../shared/lib/scheduledWidget', () => ({
  getInitialWidgetOpenTarget: jest.fn(),
  getInitialWidgetMessageId: jest.fn(),
  consumeInitialWidgetOpen: jest.fn(),
}));

import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';

import {
  getInitialWidgetOpenTarget,
  getInitialWidgetMessageId,
  consumeInitialWidgetOpen,
} from '../../../shared/lib/scheduledWidget';
import {
  openScheduledTab,
  setMainTabsApi,
  setScheduledFocusListener,
  __resetMainTabsApiForTests,
  SCHEDULED_TAB_INDEX,
} from '../../../app/mainTabsApi';
import { handleWidgetOpen, useWidgetNavigation } from '../useWidgetNavigation';

const getInitialOpenTarget = getInitialWidgetOpenTarget as jest.MockedFunction<
  typeof getInitialWidgetOpenTarget
>;
const getInitialMessageId = getInitialWidgetMessageId as jest.MockedFunction<
  typeof getInitialWidgetMessageId
>;
const consumeOpen = consumeInitialWidgetOpen as jest.MockedFunction<
  typeof consumeInitialWidgetOpen
>;

describe('handleWidgetOpen', () => {
  const switchToTab = jest.fn();

  beforeEach(() => {
    __resetMainTabsApiForTests();
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
    setMainTabsApi({ switchToTab });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should open Scheduled tab without focus when messageId is missing', () => {
    handleWidgetOpen('scheduled');

    expect(switchToTab).toHaveBeenCalledWith(SCHEDULED_TAB_INDEX);
  });

  it('should open Scheduled tab and focus row when messageId is present', () => {
    const onFocus = jest.fn();
    setScheduledFocusListener(onFocus);

    handleWidgetOpen('scheduled', 'msg-7');

    expect(switchToTab).toHaveBeenCalledWith(SCHEDULED_TAB_INDEX);
    expect(onFocus).toHaveBeenCalledWith({
      messageId: 'msg-7',
      focusNonce: 1_700_000_000_000,
    });
  });

  it('should ignore unknown open targets', () => {
    handleWidgetOpen('settings');

    expect(switchToTab).not.toHaveBeenCalled();
  });
});

describe('openScheduledTab', () => {
  const switchToTab = jest.fn();

  beforeEach(() => {
    __resetMainTabsApiForTests();
    jest.clearAllMocks();
    setMainTabsApi({ switchToTab });
  });

  it('should queue tab switch when api is not ready yet', () => {
    __resetMainTabsApiForTests();
    openScheduledTab();

    expect(switchToTab).not.toHaveBeenCalled();

    setMainTabsApi({ switchToTab });
    expect(switchToTab).toHaveBeenCalledWith(SCHEDULED_TAB_INDEX);
  });
});

describe('useWidgetNavigation', () => {
  const switchToTab = jest.fn();
  const originalOS = Platform.OS;
  const remove = jest.fn();
  let widgetOpenHandler:
    | ((event: { openTarget: string; messageId?: string }) => void)
    | undefined;

  beforeEach(() => {
    __resetMainTabsApiForTests();
    jest.clearAllMocks();
    widgetOpenHandler = undefined;
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'android' });
    NativeModules.WidgetModule = {
      addListener: jest.fn(),
      removeListeners: jest.fn(),
    };
    jest.spyOn(NativeEventEmitter.prototype, 'addListener').mockImplementation((eventName, handler) => {
      if (eventName === 'onWidgetOpen') {
        widgetOpenHandler = handler as typeof widgetOpenHandler;
      }
      return { remove };
    });
    getInitialOpenTarget.mockResolvedValue(null);
    getInitialMessageId.mockResolvedValue(null);
    setMainTabsApi({ switchToTab });
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => originalOS });
    delete NativeModules.WidgetModule;
    jest.restoreAllMocks();
  });

  it('should not open Scheduled when unmounted before getInitial resolves', async () => {
    let resolveTarget: (value: string | null) => void = () => {};
    getInitialOpenTarget.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveTarget = resolve;
        }),
    );
    getInitialMessageId.mockResolvedValue('msg-late');

    const { unmount } = renderHook(() => useWidgetNavigation());
    unmount();

    await act(async () => {
      resolveTarget('scheduled');
    });

    expect(consumeOpen).not.toHaveBeenCalled();
    expect(switchToTab).not.toHaveBeenCalled();
  });

  it('should consume extras when onWidgetOpen fires', async () => {
    renderHook(() => useWidgetNavigation());
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      widgetOpenHandler?.({ openTarget: 'scheduled', messageId: 'msg-9' });
    });

    expect(consumeOpen).toHaveBeenCalledTimes(1);
    expect(switchToTab).toHaveBeenCalledWith(SCHEDULED_TAB_INDEX);
  });

  it('should ignore late getInitial after onWidgetOpen already handled the tap', async () => {
    let resolveTarget: (value: string | null) => void = () => {};
    getInitialOpenTarget.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveTarget = resolve;
        }),
    );
    getInitialMessageId.mockResolvedValue('msg-1');

    renderHook(() => useWidgetNavigation());

    act(() => {
      widgetOpenHandler?.({ openTarget: 'scheduled', messageId: 'msg-1' });
    });
    expect(switchToTab).toHaveBeenCalledTimes(1);
    expect(consumeOpen).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveTarget('scheduled');
    });

    expect(switchToTab).toHaveBeenCalledTimes(1);
    expect(consumeOpen).toHaveBeenCalledTimes(1);
  });
});
