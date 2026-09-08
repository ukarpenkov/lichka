import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ChatHeader } from '../ChatHeader';
import { hapticTap } from '../../../shared/lib/haptics';
import type { Chat } from '../../../entities/chat';

jest.mock('../../../shared/config/ThemeProvider', () => ({
  useTheme: () => ({
    text: '#000000',
    colors: {
      canvas: '#FFFFFF',
      ink: '#000000',
      muted: 'rgba(0,0,0,0.6)',
      surfaceSoft: 'rgba(0,0,0,0.06)',
    },
  }),
}));

jest.mock('../../../widgets/chat-avatar', () => ({
  ChatAvatar: () => null,
}));

jest.mock('../../../shared/lib/haptics', () => ({
  hapticTap: jest.fn(),
}));

const chat: Chat = {
  id: 'chat-1',
  title: 'Saved',
  avatarPath: null,
  isSystem: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('ChatHeader', () => {
  beforeEach(() => {
    (hapticTap as jest.Mock).mockClear();
  });

  it('should trigger hapticTap when leaving the chat via back', () => {
    const onBack = jest.fn();
    const { getByTestId } = render(
      <ChatHeader
        chat={chat}
        onBack={onBack}
        onTitlePress={jest.fn()}
        onSearch={jest.fn()}
      />,
    );

    fireEvent.press(getByTestId('chat-header-back'));

    expect(hapticTap).toHaveBeenCalledTimes(1);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('should trigger hapticTap when opening search', () => {
    const onSearch = jest.fn();
    const { getByTestId } = render(
      <ChatHeader
        chat={chat}
        onBack={jest.fn()}
        onTitlePress={jest.fn()}
        onSearch={onSearch}
      />,
    );

    fireEvent.press(getByTestId('chat-header-search'));

    expect(hapticTap).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it('should trigger hapticTap when opening the chat form from the title', () => {
    const onTitlePress = jest.fn();
    const { getByTestId } = render(
      <ChatHeader
        chat={chat}
        onBack={jest.fn()}
        onTitlePress={onTitlePress}
        onSearch={jest.fn()}
      />,
    );

    fireEvent.press(getByTestId('chat-header-title'));

    expect(hapticTap).toHaveBeenCalledTimes(1);
    expect(onTitlePress).toHaveBeenCalledTimes(1);
  });
});
