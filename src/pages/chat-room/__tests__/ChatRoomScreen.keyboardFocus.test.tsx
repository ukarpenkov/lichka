import React from 'react';
import { act, render } from '@testing-library/react-native';

const mockComposerMount = jest.fn();
const mockComposerUnmount = jest.fn();
const mockListMount = jest.fn();
const mockListUnmount = jest.fn();
const mockNavigation = {
  addListener: jest.fn(() => jest.fn()),
  goBack: jest.fn(),
  setParams: jest.fn(),
};

jest.mock('react-native-gesture-handler', () => {
  const ReactModule = require('react');
  const ReactNative = require('react-native');
  const chainable = () => {
    const gesture: Record<string, () => unknown> = {};
    [
      'enabled',
      'activeOffsetX',
      'activeOffsetY',
      'failOffsetX',
      'simultaneousWithExternalGesture',
      'blocksExternalGesture',
      'onBegin',
      'onUpdate',
      'onEnd',
    ].forEach((method) => {
      gesture[method] = () => gesture;
    });
    return gesture;
  };
  const MockFlatList = ReactModule.forwardRef(
    (props: Record<string, unknown>, ref: React.Ref<unknown>) => {
      ReactModule.useEffect(() => {
        mockListMount();
        return mockListUnmount;
      }, []);
      return ReactModule.createElement(ReactNative.View, {
        ...props,
        ref,
        testID: 'history-list',
      });
    },
  );
  return {
    Gesture: { Native: chainable, Pan: chainable, Manual: chainable, Tap: chainable },
    GestureDetector: ({ children }: { children: React.ReactNode }) => children,
    FlatList: MockFlatList,
    TextInput: ReactNative.TextInput,
  };
});

jest.mock('@react-navigation/native', () => {
  const ReactModule = require('react');
  return {
    useNavigation: () => mockNavigation,
    useRoute: () => ({
      params: { chatId: 'chat-1', mode: 'history' },
    }),
    useFocusEffect: (callback: () => void | (() => void)) => {
      ReactModule.useEffect(callback, [callback]);
    },
  };
});

jest.mock('../../../shared/config', () => ({
  useTheme: () => ({ colors: { canvas: '#fff', ink: '#000' } }),
  useLocale: () => ({
    t: {
      chatNotFound: 'Chat not found',
      futureMode: 'Future',
      futureExitA11y: 'Exit future',
      futurePeekA11y: 'Enter future',
    },
  }),
  spacing: { sm: 8, gutter: 16 },
}));

jest.mock('../../../shared/lib', () => ({
  useKeyboardHeight: () => ({ value: 0 }),
  getAndroidChatAreaKeyboardPad: () => 0,
  KEYBOARD_ANDROID_LIFT_FUDGE: 0,
  KEYBOARD_COMPOSER_GAP: 0,
  MESSAGE_LIST_BOTTOM_GAP: 0,
  PAGER_TAB_BAR_HEIGHT: 0,
  setClipboardString: jest.fn(),
}));

jest.mock('../../../shared/ui', () => {
  const ReactModule = require('react');
  const { Text } = require('react-native');
  return {
    Text: ({ children, ...props }: { children?: React.ReactNode }) =>
      ReactModule.createElement(Text, props, children),
    AlertDialog: () => null,
  };
});

jest.mock('../../../entities/chat', () => ({
  getChatById: () => ({ id: 'chat-1', title: 'Saved', avatarPath: null }),
}));

jest.mock('../../../entities/message', () => ({
  getVisibleMessagesByChatId: () => [],
  getPeriodicDisplayMessages: () => [],
  getScheduledMessagesByChatId: () => [],
  disableFiredMessages: jest.fn(),
  deleteMessage: jest.fn(),
  getMessageById: jest.fn(),
  isPeriodicDisplayId: () => false,
  extractTemplateId: (id: string) => id,
}));

jest.mock('../../../features/notifications', () => ({
  cancelNotification: jest.fn(),
}));

jest.mock('../../../features/scheduled-widget', () => ({
  syncScheduledWidgetSnapshot: jest.fn(),
}));

jest.mock('../../../features/unread-badges', () => ({
  markChatAsRead: jest.fn(),
}));

jest.mock('../../../features/edit-message', () => ({
  useEditMessage: () => ({ saveEdit: jest.fn() }),
}));

const mockPeekGesture = () => ({
  gesture: {},
  nativeGesture: {},
  rubberBandStyle: {},
  overlayStyle: {},
  reset: jest.fn(),
});

jest.mock('../../../features', () => ({
  ImageViewer: () => null,
  FuturePeekOverlay: () => null,
  useImageViewer: () => ({
    open: jest.fn(),
    close: jest.fn(),
    visible: false,
    data: null,
    openKey: 0,
  }),
  useFuturePeekEntryGesture: () => mockPeekGesture(),
  useFuturePeekExitGesture: () => mockPeekGesture(),
}));

jest.mock('../../../widgets/chat-form', () => ({
  ChatForm: () => null,
}));

jest.mock('../../../widgets/message-composer', () => {
  const ReactModule = require('react');
  const { View: NativeView } = require('react-native');
  return {
    MessageComposer: () => {
      ReactModule.useEffect(() => {
        mockComposerMount();
        return mockComposerUnmount;
      }, []);
      return ReactModule.createElement(NativeView, { testID: 'message-composer' });
    },
  };
});

jest.mock('../../../app/mainTabsApi', () => ({
  navigateToScheduled: jest.fn(),
}));

jest.mock('../ChatHeader', () => ({ ChatHeader: () => null }));
jest.mock('../MessageLine', () => ({ MessageLine: () => null }));
jest.mock('../MessageContextMenu', () => ({ MessageContextMenu: () => null }));
jest.mock('../MessageEditor', () => ({ MessageEditor: () => null }));
jest.mock('../DateSeparator', () => ({ DateSeparator: () => null }));
jest.mock('../SearchOverlay', () => ({ SearchOverlay: () => null }));
jest.mock('../FutureTimeline', () => ({ FutureTimeline: () => null }));

import { ChatRoomScreen } from '../ChatRoomScreen';

describe('ChatRoomScreen keyboard focus regression', () => {
  beforeEach(() => {
    mockComposerMount.mockClear();
    mockComposerUnmount.mockClear();
    mockListMount.mockClear();
    mockListUnmount.mockClear();
  });

  it('should keep the composer mounted when at-bottom state changes', () => {
    const screen = render(<ChatRoomScreen />);

    expect(screen.getByTestId('message-composer')).toBeTruthy();
    expect(mockComposerMount).toHaveBeenCalledTimes(1);

    const list = screen.getByTestId('history-list');

    act(() => {
      list.props.onContentSizeChange(0, 1000);
    });

    expect(mockComposerMount).toHaveBeenCalledTimes(1);
    expect(mockComposerUnmount).not.toHaveBeenCalled();
  });

  it('should keep the composer mounted when the keyboard opens', () => {
    const { Keyboard } = require('react-native');
    let showHandler: ((e?: { endCoordinates: { height: number } }) => void) | undefined;
    const addListener = jest.spyOn(Keyboard, 'addListener').mockImplementation((event, handler) => {
      if (event === 'keyboardDidShow') {
        showHandler = handler as typeof showHandler;
      }
      return { remove: jest.fn() };
    });

    const screen = render(<ChatRoomScreen />);
    expect(screen.getByTestId('message-composer')).toBeTruthy();
    expect(mockComposerMount).toHaveBeenCalledTimes(1);

    act(() => {
      showHandler?.({ endCoordinates: { height: 300 } } as never);
    });

    expect(screen.getByTestId('message-composer')).toBeTruthy();
    expect(mockComposerMount).toHaveBeenCalledTimes(1);
    expect(mockComposerUnmount).not.toHaveBeenCalled();

    addListener.mockRestore();
  });

  it('should keep the history list mounted when the keyboard opens and closes', () => {
    const { Keyboard } = require('react-native');
    let showHandler: ((e?: { endCoordinates: { height: number } }) => void) | undefined;
    let hideHandler: (() => void) | undefined;
    const addListener = jest.spyOn(Keyboard, 'addListener').mockImplementation((event, handler) => {
      if (event === 'keyboardDidShow') {
        showHandler = handler as typeof showHandler;
      }
      if (event === 'keyboardDidHide') {
        hideHandler = handler as typeof hideHandler;
      }
      return { remove: jest.fn() };
    });

    render(<ChatRoomScreen />);
    expect(mockListMount).toHaveBeenCalledTimes(1);

    act(() => {
      showHandler?.({ endCoordinates: { height: 300 } } as never);
    });
    expect(mockListMount).toHaveBeenCalledTimes(1);
    expect(mockListUnmount).not.toHaveBeenCalled();

    act(() => {
      hideHandler?.();
    });
    expect(mockListMount).toHaveBeenCalledTimes(1);
    expect(mockListUnmount).not.toHaveBeenCalled();

    addListener.mockRestore();
  });
});
