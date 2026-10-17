import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { ScrollView } from 'react-native';
import { createChat } from '../../../entities/chat';
import { ChatForm } from '../ChatForm';

jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  __esModule: true,
  default: { OS: 'android', select: (values: Record<string, unknown>) => values.android ?? values.default },
}));
jest.mock('react-native/Libraries/ReactNative/requireNativeComponent', () => ({
  __esModule: true, default: () => 'KeyboardInsetsProbe',
}));
jest.mock('../../../shared/config', () => ({
  useTheme: () => ({ text: '#0f0', background: '#000' }),
  useLocale: () => ({ t: { newChat: 'New chat', create: 'Create', chatNamePlaceholder: 'Chat name', photo: 'Photo', icon: 'Icon' } }),
  monoWeight: () => ({}),
}));
jest.mock('../../../shared/ui', () => {
  const ReactModule = require('react');
  const { Text, TextInput, Pressable } = require('react-native');
  return {
    Text,
    Input: TextInput,
    Button: ({ title, ...props }: { title: string }) => ReactModule.createElement(
      Pressable, props, ReactModule.createElement(Text, null, title),
    ),
    AlertDialog: () => null,
    KeyboardAwareView: require('../../../shared/ui/KeyboardAwareView').KeyboardAwareView,
  };
});
jest.mock('../../../shared/lib', () => ({ generateId: () => 'new-chat' }));
jest.mock('../../../entities/chat', () => ({ createChat: jest.fn(), updateChat: jest.fn() }));
jest.mock('../../../features/pixel-avatar', () => ({}));
jest.mock('../IconGrid', () => ({ IconGrid: () => null }));

it('keeps the create action outside scrolling content and saves the draft above the keyboard', async () => {
  const onSaved = jest.fn();
  const onClose = jest.fn();
  const screen = render(<ChatForm visible onClose={onClose} onSaved={onSaved} />);
  fireEvent.changeText(screen.getByPlaceholderText('Chat name'), 'Keyboard test');
  fireEvent(screen.getByTestId('keyboard-insets-probe', { includeHiddenElements: true }),
    'keyboardOverlap', { nativeEvent: { overlap: 320 } });

  // Saving stays fixed; only avatar and name need to scroll on a short viewport.
  const scroll = screen.UNSAFE_getByType(ScrollView);
  expect(scroll.findAllByProps({ children: 'Create' })).toHaveLength(0);
  expect(screen.getByPlaceholderText('Chat name').props.value).toBe('Keyboard test');
  await act(async () => { fireEvent.press(screen.getByText('Create')); });
  expect(createChat).toHaveBeenCalledWith('Keyboard test', null);
  expect(onSaved).toHaveBeenCalledTimes(1);
  expect(onClose).toHaveBeenCalledTimes(1);
});
